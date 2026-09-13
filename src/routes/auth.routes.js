import express from "express";
import {userRegisterController} from "../controller/auth.controller.js"


const router = express.Router()


/**
* - POST /register
* - Register a new user
* - url will be /api/auth/register
*/
router.post('/register', userRegisterController)
router.get("/", (req, res) => {
 res.json({ message: "this is sample" })
})

export default router;
