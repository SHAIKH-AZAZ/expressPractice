import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { createTransaction } from "../controller/transcation.controller";

const transactionRouter = Router();
// middleware pre handle
transactionRouter.use(authMiddleware);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Returns a list of all transactions
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   date:
 *                     type: string
 *                   description:
 *                     type: string
 *                   userId:
 *                     type: string
 *
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

transactionRouter.post('/', createTransaction)

export default transactionRouter;
