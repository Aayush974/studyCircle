import mongoose from "mongoose";
import { Membership } from "../models/membership.model.js";
import { StudyRoom } from "../models/studyRoom.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createMembership } from "../utils/membership.js";

const createStudyRoom = asyncHandler(async (req, res) => {
  const { userId, workspaceId, name } = req.body;

  if (name.trim() === "") {
    throw new ApiError(400, "please provide a name for the workspace");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

  const wsmembership = await Membership.findOne({
    userId,
    targetId: workspaceId,
    targetType: "workspace",
  });

  if (!wsmembership) {
    throw new ApiError(404, "invalid request");
  }

  if (wsmembership.role === "member") {
    throw new ApiError(401, "action requires an admin or owner");
  }

  const studyRoom = await StudyRoom.create({
    name,
    createdBy: userObjectId,
    workspaceId: workspaceObjectId,
  });

  if (!studyRoom) {
    throw new ApiError(500, "something went wrong while creating studyRoom");
  }

  try {
    await createMembership(userId, studyRoom._id, "studyRoom", "owner");
  } catch (error) {
    await StudyRoom.findByIdAndDelete(studyRoom._id);
    throw error;
  }

  return res.status(201).json({
    status: 200,
    success: true,
    message: "new studyRoom created successfully",
    studyRoom,
  });
});

const getAllRooms = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const rooms = await StudyRoom.find({
    workspaceId: workspaceObjectId,
  });
  if (!rooms) {
    throw new ApiError(402, "something went wrong");
  }
  return res.status(200).json({
    status: 200,
    success: true,
    message: "fetched rooms successfully",
    studyRooms: rooms,
  });
});

export { createStudyRoom, getAllRooms };
