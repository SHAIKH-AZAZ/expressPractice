import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../services/email.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * POST /register
 * Register a new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
export const userRegisterController = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const isExists = await userModel.findOne({ email: email });
    if (isExists) {
        throw new ApiError(400, "User already exists");
    }
    const user = await userModel.create({ email, password, name });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    res.cookie("token", token);

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: name,
        },
        status: "success",
        token,
    });

    // Registration already succeeded and the response is sent - an email
    // failure here must not surface as a request error.
    try {
        await sendRegistrationEmail(user.email, user.name);
    } catch (error) {
        console.error(`Failed to send registration email for ${user._id}:`, error);
    }
});

/**
 * POST api/auth/login
 * Login a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
export const userLoginController = asyncHandler(async (req, res) => {
    // getting email and password from request body
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email }).select("password");

    // checking if user exists
    if (!user) {
        throw new ApiError(401, "User not found");
    }
    // checking password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
        throw new ApiError(401, "Invalid Credentials");
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
});
