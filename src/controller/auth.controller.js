import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";

/**
 * POST /register
 * Register a new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
export const userRegisterController = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const isExists = await userModel.findOne({ email: email });
        if (isExists) {
            return res.status(400).json({
                message: "User already exists",
                status: "failed",
            });
        }
        const user = await userModel.create({ email, password, name });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.cookie("token", token);

        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: name,
            },
            status: "success",
            token,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "failed",
        });
    }
};

/**
 * POST api/auth/login
 * Login a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
export const userLoginController = async (req, res) => {
    try {
        // getting email and password from request body
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email }).select("+password");

        // checking if user exists
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "failed",
            });
        }
        // checking password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid Credentials",
                status: "failed",
            });
        }

        // token generation
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.cookie("token", token);
        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            status: "success",
            token,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "failed",
        });
    }
};
