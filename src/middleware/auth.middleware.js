import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    console.log(`authMiddleware: ${req.originalUrl}`);
    console.log(`authMiddleware: ${req.header("Authorization")}`);


    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "No token, authorization denied" });
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

export default authMiddleware;
