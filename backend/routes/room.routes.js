import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  createRoom,
  getAllRooms,
} from "../controllers/room.controller.js";

const roomRouter = Router();

roomRouter.post("/create-room", verifyJwt, createRoom);
roomRouter.get("/get-allRooms/:workspaceId", verifyJwt, getAllRooms);

export default roomRouter;
