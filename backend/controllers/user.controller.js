import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import fs from "fs";

// fxn to handle the registering of users
const registerUser = asyncHandler(async function (req, res, next) {
  // this try catch block,inspite of the asynHandler, is required to remove any files stored in temp folder provided that any error occurs, if not done the junk files will keep on accumulating locally
  try {

    const { username, email, password } = req.body; // the body added by multer here
    const isFieldEmpty = [username, email, password].some(
      (val) => !val || val.toString().trim() == ""
    );

    if (isFieldEmpty) {
      throw new ApiError(400, "all fields are required");
    }

    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      throw new ApiError(400, "the user is already registered");
    }

    const localAvatarFilePath = req.file?.path;
    let uploadedFileUrl;

    if (localAvatarFilePath) {
      const uploadedFileData = await uploadOnCloudinary(localAvatarFilePath);
      if (!uploadedFileData) {
        throw new ApiError(500, "file could not be uploaded to cloudinary");
      }
      uploadedFileUrl = uploadedFileData.secure_url;
    }

    const user = await User.create({
      email,
      password,
      username,
      avatar: uploadedFileUrl ? uploadedFileUrl : "",
    });

    const newUser = user?.toObject();

    if (!newUser)
      throw new ApiError(
        500,
        "something went wrong while registering the suer"
      );

    delete newUser.password;

    return res.status(200).json({
      status: 200,
      success: true,
      message: "user registered successfully",
      user: newUser,
    });
  } catch (error) {
    if (req?.file) fs.unlinkSync(req.file?.path);
    throw error;
  }
});

export { registerUser };
