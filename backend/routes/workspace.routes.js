import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { createWorkspace } from "../controllers/workspace.controller.js";

const workspaceRouter = Router();

workspaceRouter.post("/create-workspace", verifyJwt, createWorkspace);

export default workspaceRouter;