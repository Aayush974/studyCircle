import { Membership } from "../models/membership.model.js";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createMembership,
  deleteAllMemberships,
  getAllMembership,
  getMembership,
} from "../utils/membership.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/uploadOnCloudinary.js";
import fs from "fs";

const createWorkspace = asyncHandler(async (req, res) => {
  try {
    const { name, passwordRequired } = req.body;

    if (name.trim() == "") {
      throw new ApiError(400, "please provide a name for the workspace");
    }
    const user = req.user; // from auth middleware

    if (passwordRequired == "true" && !req.body.password) {
      throw new ApiError(400, "password required");
    }
    const password = passwordRequired == "true" ? req.body.password : null; // the url encoded will send true/false as strings not booleans

    if (!user.isEmailVerified) {
      throw new ApiError(401, "user email not verified");
    }

    // the multer file is named avatar hence why we ues it here in the name convention but the database entry is under 'logo' for workspace image
    const localAvatarFilePath = req.file?.path;
    let uploadedFileUrl;
    let publicId;
    if (localAvatarFilePath) {
      const uploadedFileData = await uploadOnCloudinary(localAvatarFilePath);
      uploadedFileUrl = uploadedFileData.secure_url;
      publicId = uploadedFileData.public_id;
    }

    const workspace = await Workspace.create({
      name,
      createdBy: user._id,
      passwordRequired,
      password,
      logo: uploadedFileUrl ? uploadedFileUrl : null,
    });

    const newWorkspace = workspace?.toObject();

    if (!newWorkspace) {
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }

      throw new ApiError(
        500,
        "something went wrong while creating the workspace"
      );
    }

    // creating a membership upon successful creation of a workspace so as to let the user creating it be joined to it at role "owner"
    try {
      await createMembership(user._id, newWorkspace._id, "workspace", "owner");
    } catch (error) {
      await Workspace.findByIdAndDelete(newWorkspace._id); // a workspace won't exist without the membership so deleting the workspace upon failure in creating a membership
      throw error;
    }

    delete workspace.password;

    return res.status(201).json({
      status: 200,
      success: true,
      message: "new workspace created successfully",
      newWorkspace,
    });
  } catch (error) {
    if (req?.file) fs.unlinkSync(req.file?.path);
    throw error;
  }
});

const joinWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, password } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  // a workspace may or may not have password required to join it
  const passwordRequired = workspace.passwordRequired;

  // if password required check its correctness
  if (passwordRequired) {
    let isPasswordValid = await workspace.validatePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "wrong password entered");
    }
  }

  const userId = req.user._id;
  await createMembership(userId, workspaceId, "workspace", "member"); // creating a membership for a new joining

  return res.status(200).json({
    status: 200,
    success: true,
    message: "user joined workspace successfully",
  });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.body;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  // only owner can delete the workspace
  const user = req.user;
  const isOwner = user._id.equals(workspace.createdBy);

  if (!isOwner) {
    throw new ApiError(401, "you are not authorized to perform this action");
  }

  const logoUrl = workspace.logo;
  const workspaceInstance = await Workspace.findByIdAndDelete(workspace._id);
  await deleteAllMemberships(workspaceId); // deleting all the memberships associated with the workspace
  if (workspace.logo) {
    const publicId = getPublicIdFromUrl(workspace.logo);
    await deleteFromCloudinary(publicId);
  }

  return res.status(200).json({
    status: 200,
    success: true,
    message: "workspace deleted succcessfully",
    workspace: workspaceInstance,
  });
});

const getWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  return res.status(200).json({
    status: 200,
    success: true,
    message: "fetched workspace data successfully",
    workspace,
  });
});

const getUserWorkspaces = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const workspaces = await Membership.aggregate([
    {
      // getting the required memberships
      $match: {
        userId: userId,
        targetType: "workspace",
      },
    },
    {
      // adding a new field to convert the targetId string to ObjectId type for lookup
      $addFields: {
        workspaceObjectId: { $toObjectId: "$targetId" },
      },
    },
    {
      // looking up the workspaces collection to get the workspace details
      $lookup: {
        from: "workspaces",
        localField: "workspaceObjectId",
        foreignField: "_id",
        as: "workspace",
      },
    },
    {
      // unwind the workspace arry to get individual workspace documents
      $unwind: "$workspace",
    },
    {
      // replace the root since membership details are not required only workspace
      $replaceRoot: { newRoot: "$workspace" },
    },
  ]);
  if (!workspaces) {
    throw new ApiError(404, "workspaces not found");
  }
  return res.status(200).json({
    status: 200,
    success: true,
    message: "fetched workspaces data successfully",
    workspaces,
  });
});

const getMemberships = asyncHandler(async (req, res) => {
  const { workspaceId } = req.body;
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  // all memberships can be accessed by either an admin or the owner
  const membership = await getMembership(workspaceId, req.user._id.toString());
  if (membership.role == "member") {
    throw new ApiError(401, "action requires an admin or owner");
  }

  const memberships = await getAllMembership(workspaceId);

  return res.status(200).json({
    status: 200,
    success: true,
    message: "fetched workspace data successfully",
    memberships,
  });
});

const searchWorkspaces = asyncHandler(async (req, res) => {
  const { name } = req.query;

  if (!name) {
    throw new ApiError(400, "search name is required");
  }

  const workspaces = await Workspace.find({
    name: { $regex: name, $options: "i" }, // case-insensitive partial match
  }).select("-password");

  if (!workspaces || workspaces.length === 0) {
    throw new ApiError(404, "no matching workspaces found");
  }

  return res.status(200).json({
    status: 200,
    success: true,
    message: "workspaces fetched successfully",
    workspaces, // always an array
  });
});

const updateName = asyncHandler(async (req, res) => {
  const { workspaceId, name } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  if (!name) {
    throw new ApiError(400, "please enter a valid name");
  }

  // name can be update by either an admin or the owner
  const membership = await getMembership(workspaceId, req.user._id.toString());
  if (membership.role == "member") {
    throw new ApiError(401, "action requires an admin or owner");
  }

  workspace.name = name.trim();

  const updatedWorkspace = await workspace.save();

  if (!updatedWorkspace) {
    throw new ApiError(
      500,
      "couldn't save the data to workspace something went wrong"
    );
  }

  return res.status(200).json({
    status: 200,
    success: true,
    message: "updated workspace name successfully",
    workspace: updatedWorkspace,
  });
});

const updateLogo = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, "workspace not found");
    }

    // can only be updated by admin or owner
    const membership = await getMembership(
      workspaceId,
      req.user._id.toString()
    );
    if (membership.role == "member") {
      throw new ApiError(401, "action requires an admin or owner");
    }

    const localAvatarFilePath = req.file?.path;
    if (!localAvatarFilePath) {
      throw new ApiError(400, "file required");
    }
    let uploadedFileData;

    uploadedFileData = await uploadOnCloudinary(localAvatarFilePath);
    const uploadedFileUrl = uploadedFileData.secure_url;

    // deleting the old image if it exists
    if (workspace.logo) {
      const publicId = getPublicIdFromUrl(workspace.logo);
      await deleteFromCloudinary(publicId);
    }

    workspace.logo = uploadedFileUrl;
    const updatedWorkspace = await workspace.save({
      validateBeforeSave: false,
    });

    if (!updatedWorkspace) {
      throw new ApiError(
        500,
        "couldn't save the data to workspace something went wrong"
      );
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: "updated photo successfully",
      workspace: updatedWorkspace,
    });
  } catch (error) {
    if (req?.file) fs.unlinkSync(req.file?.path);
    throw error;
  }
});

const addAdmin = asyncHandler(async (req, res) => {
  const { workspaceId, targetUser } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  const targetUserData = await User.findById(targetUser);

  if (!targetUserData) {
    throw new ApiError(404, "target user not found");
  }

  if (!targetUserData.isEmailVerified) {
    throw new ApiError(401, "the target user's email is not verified");
  }

  if (workspace.createdBy.toString() == targetUser) {
    throw new ApiError(422, "the role of owner can't be changed");
  }

  const user = req.user;
  const isOwner = user._id.equals(workspace.createdBy);

  if (!isOwner) {
    throw new ApiError(
      401,
      "you are not authorized to perform this action, the owner is required"
    );
  }

  const membership = await getMembership(workspace._id, targetUser);

  membership.role = "admin";

  await membership.save();

  return res.status(200).json({
    status: 200,
    success: true,
    message: "updated user to admin",
  });
});

const removeAdmin = asyncHandler(async (req, res) => {
  const { workspaceId, targetUser } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  const targetUserData = await User.findById(targetUser);

  if (!targetUserData) {
    throw new ApiError(404, "target user not found");
  }

  if (!targetUserData.isEmailVerified) {
    throw new ApiError(401, "the target user's email is not verified");
  }

  if (workspace.createdBy.toString() == targetUser) {
    throw new ApiError(422, "the role of owner can't be changed");
  }

  const user = req.user;
  const isOwner = user._id.equals(workspace.createdBy);

  if (!isOwner) {
    throw new ApiError(
      401,
      "you are not authorized to perform this action, the owner is required"
    );
  }

  const membership = await getMembership(workspace._id, targetUser);

  membership.role = "member";

  await membership.save();

  return res.status(200).json({
    status: 200,
    success: true,
    message: "updated user to member",
  });
});

const leaveWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "workspace not found");
  }

  const user = req.user;

  const membership = await getMembership(workspaceId, user._id.toString());

  await Membership.findByIdAndDelete(membership._id);

  return res.status(200).json({
    status: 200,
    success: true,
    message: "successfully left the workspace",
  });
});

export {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  getMemberships,
  updateName,
  updateLogo,
  addAdmin,
  removeAdmin,
  joinWorkspace,
  leaveWorkspace,
  getUserWorkspaces,
  searchWorkspaces,
};
