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

    // checking if fields are empty or not
    const isFieldEmpty = [username, email, password].some(
      (val) => !val || val.toString().trim() == ""
    );

    if (isFieldEmpty) {
      throw new ApiError(400, "all fields are required");
    }

    //checking if user already exists
    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      throw new ApiError(400, "the user is already registered");
    }

    //getting the localAvatar file path to upload it to cloudinary
    const localAvatarFilePath = req.file?.path;
    let uploadedFileUrl;

    if (localAvatarFilePath) {
      const uploadedFileData = await uploadOnCloudinary(localAvatarFilePath);
      if (!uploadedFileData) {
        throw new ApiError(500, "file could not be uploaded to cloudinary");
      }
      uploadedFileUrl = uploadedFileData.secure_url;
    }

    // creating a new user
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

const loginUser = asyncHandler(async function (req, res, next) {
  const { email, password } = req.body;

  const isFieldEmpty = [email, password].some(
    (val) => !val || val.toString().trim() == ""
  );

  if (isFieldEmpty) {
    throw new ApiError(400, "all fields are required");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(400, "the user does not exist");
  }

  // schema method used to verify the hashed password by bcrypt
  const isPasswordValid = user.validatePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "the password entered is wrong");
  }

  // generating access and refresh tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // updating and saving refresh token to the db
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  // cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json({
      status: 200,
      success: true,
      user,
      refreshToken,
      accessToken,
      message: "user logged in successfully",
    });
});

const logoutUser = asyncHandler(async function (req, res, next) {
  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  if(!user){
    throw new ApiError(404,"user not found")
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", req.cookies.refreshToken, options)
    .clearCookie("accessToken", req.cookies.accessToken, options)
    .json({
      status: 200,
      sucess: true,
      message: "user logged out successfull",
    });
});

export { registerUser, loginUser, logoutUser };
