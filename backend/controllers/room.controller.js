import mongoose from "mongoose";
import { Membership } from "../models/membership.model.js";
import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createMembership } from "../utils/membership.js";

const createRoom = asyncHandler(async (req, res) => {
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

  const room = await Room.create({
    name,
    createdBy: userObjectId,
    workspaceId: workspaceObjectId,
  });

  if (!room) {
    throw new ApiError(500, "something went wrong while creating room");
  }

  try {
    await createMembership(userId, room._id, "room", "owner");
  } catch (error) {
    await Room.findByIdAndDelete(room._id);
    throw error;
  }

  return res.status(201).json({
    status: 200,
    success: true,
    message: "new room created successfully",
    room,
  });
});

const getAllRooms = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const rooms = await Room.find({
    workspaceId: workspaceObjectId,
  });
  if (!rooms) {
    throw new ApiError(402, "something went wrong");
  }
  return res.status(200).json({
    status: 200,
    success: true,
    message: "fetched rooms successfully",
    rooms: rooms,
  });
});

export { createRoom, getAllRooms };
