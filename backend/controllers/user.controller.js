import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendMail from "../utils/sendMail.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/uploadOnCloudinary.js";
import fs from "fs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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
      throw new ApiError(422, "all fields are required");
    }

    //checking if user already exists
    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      throw new ApiError(409, "the user is already registered");
    }

    //getting the localAvatar file path to upload it to cloudinary
    const localAvatarFilePath = req.file?.path;
    let uploadedFileUrl;
    let publicId;
    if (localAvatarFilePath) {
      const uploadedFileData = await uploadOnCloudinary(localAvatarFilePath);
      uploadedFileUrl = uploadedFileData.secure_url;
      publicId = uploadedFileData.public_id;
    }

    // creating a new user
    const user = await User.create({
      email,
      password,
      username,
      avatar: uploadedFileUrl ? uploadedFileUrl : "",
    });

    const newUser = user?.toObject();

    if (!newUser) {
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
      throw new ApiError(
        500,
        "something went wrong while registering the suer"
      );
    }

    delete newUser.password;

    return res.status(201).json({
      status: 201,
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
    throw new ApiError(422, "all fields are required");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "the user does not exist");
  }

  // schema method used to verify the hashed password by bcrypt
  const isPasswordValid = await user.validatePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "the password entered is wrong");
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

  if (!user) {
    throw new ApiError(404, "user not found");
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

// this handler fxn will be reponsible for sending verfication emails
const sendEmailVerification = asyncHandler(async function (req, res, next) {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "the user is not valid");
  }

  // if user is already verfied
  if (user.isEmailVerified) {
    return res.status(200).json({
      status: 200,
      success: true,
      message: "user email is already verified",
    });
  }

  const { rawToken, hashedToken } = user.generateEmailVerificationToken();
  const emailVerificationTokenExpires = new Date(Date.now() + 60 * 1000); // email token expiry of 1 min
  //saving the hashed  token and its expiry to the database
  user.emailVerificationTokenExpires = emailVerificationTokenExpires;
  user.emailVerificationToken = hashedToken;
  await user.save({ validateBeforeSave: false });

  try {
    await sendMail(
      req.user.email,
      process.env.BASE_URL +
        `/users/verify-email?token=${rawToken}&ref=verification` // the link will contain the raw token
    );
  } catch (error) {
    // currently the catch block won't trigger when the user's email has valid syntax but does not exist since valid syntax emails are accepted initially but may bounce back if they don't exist this bounce back becomes out of scope of the code
    //TODO: when ready to be deployed to vercel or some other service add the website's url  mailgun webhook to detected such case
    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerificationToken: null,
      },
    });
    throw error;
  }

  return res.status(200).json({
    status: 200,
    success: true,
    message: "verification email sent successfully",
  });
});

//handler function which actually verifies email
const verifyEmail = asyncHandler(async function (req, res, next) {
  //getting token,ref from the query
  const rawToken = req.query?.token;
  const ref = req.query?.ref;

  if (!rawToken) {
    throw new ApiError(401, "email verification token not found");
  }
  if (!ref || ref != "verification") {
    throw new ApiError(400, "the ref is not valid");
  }

  //hashing the token in the same way compared to when it was created
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await User.findOne({ emailVerificationToken: hashedToken });
  if (!user) throw new ApiError(404, "user not found");

  if (user.emailVerificationTokenExpires < Date.now()) {
    throw new ApiError(
      403,
      "the email verification token has expired please generate a new one"
    );
  }

  // finally updating email verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = null; // after verifying the email, empty these fields
  user.emailVerificationTokenExpires = null;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: 200,
    success: true,
    message: "user email verified successfully",
  });
});

const refreshAccessAndRefreshToken = asyncHandler(async function (
  req,
  res,
  next
) {
  const refreshToken = req.cookies.refreshToken;
  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(403, "the token is invalid");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });
  user.toObject();

  delete user.password;
  delete user.refreshToken;

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json({
      status: 200,
      success: true,
      message: "access token refreshed successfully",
    });
});

const updatePassword = asyncHandler(async function (req, res) {
  const oldUser = req.user;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "enter the password");
  }

  if (oldPassword == newPassword) {
    throw new ApiError(422, "new password cannot be the same as old password");
  }

  const user = await User.findById(oldUser._id); // this is required to get the password field of the user object since the user in jwt don't have the passwordd field
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isPasswordValid = user.validatePassword(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(403, "the password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: 200,
    success: true,
    message: "user password changes successfully",
    user: user,
  });
});

const updateAvatar = asyncHandler(async function (req, res) {
  try {
    const user = req.user;

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "file required");
    }

    let uploadedFileData;

    uploadedFileData = await uploadOnCloudinary(avatarLocalPath);

    const uploadedFileUrl = uploadedFileData.secure_url;

    // deleting old user avatar if it exists
    if (user.avatar) {
      const publicId = getPublicIdFromUrl(user.avatar);
      await deleteFromCloudinary(publicId);
    }

    user.avatar = uploadedFileUrl;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "avatar updated successfully",
      avatarUrl: uploadedFileUrl,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    throw error;
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  sendEmailVerification,
  verifyEmail,
  refreshAccessAndRefreshToken,
  updatePassword,
  updateAvatar,
};
