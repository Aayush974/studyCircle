import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  createStudyRoom,
  getAllRooms,
} from "../controllers/studyRoom.controller.js";

const studyRoomRouter = Router();

studyRoomRouter.post("/create-studyRoom", verifyJwt, createStudyRoom);
studyRoomRouter.get("/get-allRooms/:workspaceId", verifyJwt, getAllRooms);
export default studyRoomRouter;
