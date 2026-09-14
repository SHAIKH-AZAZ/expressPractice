import mongoose from "mongoose";
import transactionsModel from "../models/transactions.model";
import accountModel from "../models/account.model";
import ledgerModel from "../models/ledger.model";
import userModel from "../models/user.models";
import { sendTransactionEmail } from "../services/email.service";

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


export const createTransaction = async (req, res) => {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    // 1.Validate request
    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'fromAccount, toAccount, amount, and idempotencyKey are required'
        });
    }

    const [sender, receiver] = await Promise.all([
        accountModel.findById(fromAccount),
        accountModel.findById(toAccount),
    ]);

    if(!sender || !receiver) {
        return res.status(400).json({
            message: 'fromAccount and toAccount must be valid account IDs'
        });
    }

    // 2. idempotency
    const existing = await transactionsModel.findOne({
        idempotencyKey,
    });

    if(existing) {
        const reply = IDEMPOTENT_RESPONSES[existing.status]
            ?? { code: 500 , message: "Transaction status is unknown"}
        return res.status(reply.code).json({
            message: reply.message,
        });
    }

    // 3. Account status
    if (sender.status !== "ACTIVE" || receiver.status !== "ACTIVE") {
        return res.status(400)
            .json({
                message: 'Account status must be ACTIVE'
            });
    }

    // 4. balance check
    const balance = await sender.getBalance();
    if (balance < amount) {
        return res.status(400)
            .json({
                message: `Insufficient balance: ${balance} is less than ${amount}`
            });
    }

    // 5-9 Atomic transaction
    const session = await mongoose.startSession();
    try {
        let transaction;
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

        // Notify sender (via WebSocket or email) outside the DB transaction - email failure must not backed money

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
        return res.status(201).json({
            message: `Transaction completed successfully`,
            transaction
        })
    } catch (error) {
        return res.status(500).json({ message: error.message, status: "failed" });
    } finally {
        session.endSession();
    }
}
