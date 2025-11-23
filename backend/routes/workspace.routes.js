import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  addAdmin,
  createWorkspace,
  deleteWorkspace,
  getMemberships,
  getWorkspace,
  joinWorkspace,
  leaveWorkspace,
  removeAdmin,
  updateLogo,
  updateName,
  getUserWorkspaces
} from "../controllers/workspace.controller.js";
import uploadMiddleware from "../middlewares/multer.middleware.js";

const workspaceRouter = Router();

workspaceRouter.post(
  "/create-workspace",
  uploadMiddleware,
  verifyJwt,
  createWorkspace
);
workspaceRouter.post("/join-workspace", verifyJwt, joinWorkspace);
workspaceRouter.post("/leave-workspace", verifyJwt, leaveWorkspace);
workspaceRouter.get("/get-workspace/data", verifyJwt, getWorkspace);
workspaceRouter.get("/get-workspace/memberships", verifyJwt, getMemberships);
workspaceRouter.get("/get-user/workspaces", verifyJwt, getUserWorkspaces);
workspaceRouter.patch("/update/name", verifyJwt, updateName);
workspaceRouter.patch("/update/logo", uploadMiddleware, verifyJwt, updateLogo);
workspaceRouter.patch("/update/add-admin", verifyJwt, addAdmin);
workspaceRouter.patch("/update/remove-admin", verifyJwt, removeAdmin);
workspaceRouter.delete("/delete-workspace", verifyJwt, deleteWorkspace);

export default workspaceRouter;
