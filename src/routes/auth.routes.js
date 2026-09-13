import express from "express";
import {userRegisterController , userLoginController} from "../controller/auth.controller.js"


const router = express.Router()


/**
* - POST /register
* - Register a new user
* - url will be /api/auth/register
*/
router.post('/register', userRegisterController)

/**
* - POST /login
* - Login a user
* - url will be /api/auth/login
*/
router.post("/login", userLoginController);

router.get("/", (req, res) => {
 res.json({ message: "this is sample" })
})


export default router;
