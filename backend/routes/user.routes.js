import { Router } from "express";
import uploadMiddleware from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.post('/register',uploadMiddleware,registerUser)

export {userRouter}