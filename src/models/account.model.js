import mongoose from "mongoose";
import ledgerModel from "./ledger.model.js";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN or CLOSED",
        },
        default: "ACTIVE",
    },
    currency: {
        type: String,
        required: [true, "Currency is required for creating an account"],
        default: "INR",
    }
}, { timestamps: true });

// compound index on user and status for better query performance
accountSchema.index({ user: 1, status: 1 })

accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel
        .aggregate([
            {$match : { account: this._id }},
            {
                $group: {
                    _id: null,
                    totalDebit: {
                        $sum: {
                            $cond: [{
                                $eq: ["$type", "DEBIT"]
                            }, "$amount",
                                0
                            ]
                        }
                    },
                    totalCredit: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$type", "CREDIT"]
                                }, "$amount",
                                0
                            ]
                        }
                    },
                }
            }
        ]);

    if(balanceData.length === 0) return 0;
    return balanceData[0].totalCredit - balanceData[0].totalDebit;
};


const accountModel = mongoose.model("account", accountSchema);

export default accountModel;
