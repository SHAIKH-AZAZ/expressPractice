import accountModel from "../models/account.model.js";

export const getAccounts = async (req, res) => {
    try {
        const accounts = await accountModel.find();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAccount = async (req, res) => {
    try {
        const account = new accountModel({ ...req.body, user: req.user.userId });
        await account.save();
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAccount = async (req, res) => {
    try {
        const account = await accountModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await accountModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
