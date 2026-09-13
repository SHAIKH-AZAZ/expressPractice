import userModel from "../models/user.models.js"
import jwt from "jsonwebtoken"

/**
 * POST /register
 * Register a new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
export const userRegisterController = async (req, res) => {
  try {
    const { email, password, name } = req.body
    const isExists = await userModel.findOne({ email: email })
    if (isExists) {
      return res.status(400).json({
        message: "User already exists", status: "failed"
      })
    }
    const user = await userModel.create({ email, password, name })

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
      res.cookie("token", token);

    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: name
      },
      status: "success",
      token,
    })
  } catch (error) {

  }
}
