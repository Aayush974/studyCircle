import { Router } from "express";
import uploadMiddleware from "../middlewares/multer.middleware.js";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.post('/register',uploadMiddleware,registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/logout',verifyJwt,logoutUser)
export {userRouter}