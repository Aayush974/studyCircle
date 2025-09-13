import { Workspace } from "../models/workspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createMembership } from "../utils/membership.js";
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
    // the multer file is named avatar hence why we ues it here in the name convention but the database entry is under 'logo' for workspace image

    if (!user.isEmailVerified) {
      throw new ApiError(401, "user email not verified");
    }

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

export { createWorkspace };
