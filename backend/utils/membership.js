import { Membership } from "../models/membership.model.js";
import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { ApiError } from "./ApiError.js";

const modelMap = {
  workspace: Workspace,
  room: Room
};

const createMembership = async function (userId, targetId, targetType, role) {
  try {
    // checking is user exists
    const userExists = await User.findById(userId);
    if (!userExists) throw new ApiError(404, "User not found");

    // Checking if target exists dynamically based on type
    const TargetModel = modelMap[targetType];
    if (!TargetModel) throw new ApiError(400, "Invalid targetType");

    const targetExists = await TargetModel.findById(targetId);
    if (!targetExists) throw new ApiError(404, `${targetType} not found`);

    // make sure to wrap this in a try catch block when calling inside create workspace endpoint since we will have to delete the created workspace entry if membership creation fails
    const membershipExists = await Membership.findOne({
      targetId,
      userId,
    });
    if (membershipExists) {
      throw new ApiError(
        409,
        `the user is already joined to the ${targetType}`
      );
    }

    const membership = await Membership.create({
      userId,
      targetId,
      targetType,
      role,
    });
    return membership;
  } catch (error) {
    throw error;
  }
};

// this function is used to get all the memberships having the same targetId like all the memberships of a given workspace
const getAllMembership = async function (targetId) {
  try {
    const memberships = await Membership.find({
      targetId,
    });
    if (memberships.length == 0)
      throw new ApiError(
        404,
        `Membership under target ${targetId} does not exist`
      );
    return memberships;
  } catch (error) {
    throw error;
  }
};

// this function is used to delete all the memberships having the same targetId like all the memberships of a given workspace
const deleteAllMemberships = async function (targetId) {
  try {
    const { deletedCount } = await Membership.deleteMany({ targetId });
    if (deletedCount === 0) {
      throw new ApiError(
        404,
        `Membership under target ${targetId} does not exist`
      );
    }
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

// single membership getter
const getMembership = async function (targetId, userId) {
  try {
    const membership = await Membership.findOne({ targetId, userId });

    if (!membership)
      throw new ApiError(
        404,
        `Membership for user ${userId} under target ${targetId} does not exist`
      );

    return membership;
  } catch (error) {
    throw error;
  }
};

// single membership deleter
const deleteMembership = async function (targetId, userId) {
  try {
    const membership = await Membership.findOneAndDelete({ targetId, userId });

    if (!membership)
      throw new ApiError(
        404,
        `Membership for user ${userId} under target ${targetId} does not exist`
      );

    return membership;
  } catch (error) {
    throw error;
  }
};

export {
  createMembership,
  getAllMembership,
  deleteAllMemberships,
  getMembership,
  deleteMembership,
};
