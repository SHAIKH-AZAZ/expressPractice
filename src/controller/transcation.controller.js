import mongoose from "mongoose";
import transactionsModel from "../models/transactions.model.js";
import accountModel from "../models/account.model.js";
import ledgerModel from "../models/ledger.model.js";
import userModel from "../models/user.models.js";
import { sendTransactionEmail } from "../services/email.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Maps an existing-transaction status to an early HTTP response.
const IDEMPOTENT_RESPONSES = {
  COMPLETED: { code: 409, message: "Transaction is already processed" },
  PENDING:   { code: 200, message: "Transaction is still pending" },
  FAILED:    { code: 500, message: "Transaction failed" },
  REVERSED:  { code: 500, message: "Transaction reversed, please retry" },
};

/**
 * - Create a new Transaction
 * The 10-step TRANSFTER FLOW
 * 1. validate request
 * 2. validate idempotency key
 * 3. check account status
 * 4. Derive sender balance from ledger
 * 5. create Transcation (state pending )
 * 6. create DEBIT ladger entry
 * 7. create CREDIT ladger entry
 * 8. Mark transactions COMPLETED
 * 9. Commit the transaction mongoDB
 * 10. Send email notification
 */


export const createTransaction = asyncHandler(async (req, res) => {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    // 1.Validate request
    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        throw new ApiError(400, 'fromAccount, toAccount, amount, and idempotencyKey are required');
    }

    const [sender, receiver] = await Promise.all([
        accountModel.findById(fromAccount),
        accountModel.findById(toAccount),
    ]);

    if(!sender || !receiver) {
        throw new ApiError(400, 'fromAccount and toAccount must be valid account IDs');
    }

    // 2. idempotency
    const existing = await transactionsModel.findOne({
        idempotencyKey,
    });

    if(existing) {
        const reply = IDEMPOTENT_RESPONSES[existing.status]
            ?? { code: 500 , message: "Transaction status is unknown"}
        throw new ApiError(reply.code, reply.message);
    }

    // 3. Account status
    if (sender.status !== "ACTIVE" || receiver.status !== "ACTIVE") {
        throw new ApiError(400, 'Account status must be ACTIVE');
    }

    // 4. balance check
    const balance = await sender.getBalance();
    if (balance < amount) {
        throw new ApiError(400, `Insufficient balance: ${balance} is less than ${amount}`);
    }

    // 5-9 Atomic transaction
    const session = await mongoose.startSession();
    let transaction;
    try {
        await session.withTransaction(async () => {
            [transaction] = await transactionsModel.create(
                [{ fromAccount, toAccount, amount, idempotencyKey, status: "PENDING" }],
                { session }
            );
            await ledgerModel.create(
                [
                    {
                        account: fromAccount, transaction: transaction._id, type: "DEBIT", amount
                    },
                    {
                        account: toAccount, transaction: transaction._id, type: "CREDIT", amount
                    },
                ],
                { session }
            );
            transaction.status = "COMPLETED";
            await transaction.save({ session });
        })
    } finally {
        session.endSession();
    }

    // Notify sender outside the DB transaction - the money already moved,
    // so an email failure here must not turn a successful transfer into an error response.
    try {
        const owner = await userModel.findById(sender.user);
        if(owner) {
            await sendTransactionEmail(owner.email, owner.name, {
                    transactionId: transaction._id,
                    amount,
                    fromAccount,
                    toAccount,
                    status: transaction.status,
                    date: transaction.updatedAt,
                });
        }
    } catch (error) {
        console.error(`Failed to send transaction email for ${transaction._id}:`, error);
    }

    return res.status(201).json({
        message: `Transaction completed successfully`,
        transaction
    })
})
