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
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import fs from "fs";

// TODO: clear the cloudinary image from the cloudinary bucket also upon failures
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
    if (localAvatarFilePath) {
      const uploadedFileData = await uploadOnCloudinary(localAvatarFilePath);
      uploadedFileUrl = uploadedFileData.secure_url;
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
    console.log(isPasswordValid);
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

  const workspaceInstance = await Workspace.findByIdAndDelete(workspace._id);
  await deleteAllMemberships(workspaceId); // deleting all the memberships associated with the workspace

  return res.status(200).json({
    status: 200,
    success: true,
    message: "workspace deleted succcessfully",
    workspace: workspaceInstance,
  });
});

const getWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.body;
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
  console.log(membership);
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
    let uploadedFileUrl;
    if (localAvatarFilePath) {
      const uploadedFileData = await uploadOnCloudinary(localAvatarFilePath);
      uploadedFileUrl = uploadedFileData.secure_url;
    }

    workspace.logo = uploadedFileUrl;
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
};
