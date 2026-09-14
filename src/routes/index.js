import { Router } from "express";
import authRouter from "./auth.routes.js";
import accountRouter from "./account.routes.js";
import transactionRouter from "./transcation.routes.js";

const api = Router();
api.use("/auth", authRouter);
api.use("/accounts", accountRouter);
api.use("/transactions", transactionRouter);
export default api;
