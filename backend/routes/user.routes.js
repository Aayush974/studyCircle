import { Router } from "express";
import uploadMiddleware from "../middlewares/multer.middleware.js";
import {
  loginUser,
  logoutUser,
  refreshAccessAndRefreshToken,
  registerUser,
  sendEmailVerification,
  updateAvatar,
  updatePassword,
  verifyEmail,
} from "../controllers/user.controller.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/register", uploadMiddleware, registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", verifyJwt, logoutUser);
userRouter.get("/send-verification-email", verifyJwt, sendEmailVerification);
userRouter.get("/verify-email", verifyEmail);
userRouter.get(
  "/refresh-access-and-refresh-tokens",
  refreshAccessAndRefreshToken
);
userRouter.post("/update-password", verifyJwt, updatePassword);
userRouter.post("/update-avatar", verifyJwt, uploadMiddleware, updateAvatar);
export { userRouter };
