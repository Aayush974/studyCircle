import { Membership } from "../models/membership.model.js";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { ApiError } from "./ApiError.js";

//todo: add studyCircle to the modelmap
const modelMap = {
  workspace: Workspace,
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

export { createMembership };
