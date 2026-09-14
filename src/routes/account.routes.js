import express from "express";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "../controller/account.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
  .get(getAccounts)
  .post(createAccount);

router.route("/:id")
  .put(updateAccount)
  .delete(deleteAccount);

export default router;
