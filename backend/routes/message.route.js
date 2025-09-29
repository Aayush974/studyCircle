import { Router } from "express";
import { attachmentMiddleware } from "../middlewares/attachment.middleware.js";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  createMessage,
  getMessage,
} from "../controllers/message.controller.js";

const messageRouter = Router();

messageRouter.post(
  "/create-message",
  verifyJwt,
  attachmentMiddleware,
  createMessage
);
messageRouter.get("/get-message", verifyJwt, getMessage);

export default messageRouter;
