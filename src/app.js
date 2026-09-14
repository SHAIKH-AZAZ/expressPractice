import express from "express"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import accountRouter from "./routes/account.routes.js"
import transactionRouter from "./routes/transcation.routes.js"


const app = express()

app.use(cookieParser());
app.use(express.json());

// request logging: logs every route hit with status + response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

// routes handling
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);











export default app;
