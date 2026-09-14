import express from "express"
import cookieParser from "cookie-parser"
import api from "./routes/index.js"

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
app.use("/api", api);
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message, status: "failed" });
});











export default app;
