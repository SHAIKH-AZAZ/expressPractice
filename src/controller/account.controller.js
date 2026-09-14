import accountModel from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAccounts = asyncHandler(async (req, res) => {
    res.json(await accountModel.find());
})


export const createAccount = asyncHandler(async (req, res) => {
    const account = new accountModel({ ...req.body, user: req.user.userId });
    await account.save();
    res.json(account);
});

export const updateAccount = asyncHandler(async (req, res) => {
    const account = await accountModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(account);
});

export const deleteAccount = asyncHandler(async (req, res) => {
    await accountModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Account deleted" });
})
