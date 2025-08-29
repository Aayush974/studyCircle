import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendMail from "../utils/sendMail.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import fs from "fs";
import crypto from "crypto"
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

  const {rawToken,hashedToken} = user.generateEmailVerificationToken();
  const emailVerificationTokenExpires = Date.now() + 60*1000 // email token expiry of 
  //saving the hashed  token and its expiry to the database
  user.emailVerificationTokenExpires = emailVerificationTokenExpires
  user.emailVerificationToken = hashedToken;
  await user.save({ validateBeforeSave: false }); 
  
  //info is for debugging purpose, remove it later
  let info;
  try {
    info = await sendMail(
      req.user.email,
      process.env.BASE_URL +
        `/users/verify-email?token=${rawToken}&ref=verification` // the link will contain the raw token
    );
  } catch (error) { // currently the catch block won't trigger when the user's email has valid syntax but does not exist since valid syntax emails are accepted initially but may bounce back if they don't exist this bounce back becomes out of scope of the code
    //TODO: when ready to be deployed to vercel or some other service add the website's url  mailgun webhook to detected such case
    User.findByIdAndUpdate(user._id,{
      $set:{
        emailVerificationToken: null
      }
    })
    throw new ApiError(500, error);
  }
  console.log("info",info)

  return res
  .status(200)
  .json({
    status: 200,
    success: true,
    message:"verification email sent successfully",
  })
});

//handler function which actually verifies email
const verifyEmail = asyncHandler(async function (req,res,next) {

  //getting token,ref from the query
  const rawToken = req.query?.token
  const ref = req.query?.ref


  if(!rawToken){
    throw new ApiError(401,"email verification token not found")
  }
  if(!ref || ref != 'verification'){
    throw new ApiError(400,"the ref is not valid")
  }

  //hashing the token in the same way compared to when it was created
  const hashedToken = crypto
                        .createHash("sha256")
                        .update(rawToken)
                        .digest("hex")

  const user = await User.findOne({ emailVerificationToken:hashedToken})

  if(!user)
    throw new ApiError(404,"user not found")

  // finally updating email verification status
  user.isEmailVerified = true
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json({
    status:200,
    success:true,
    message:"user email verified successfully"
  })
})

export { registerUser, loginUser, logoutUser, sendEmailVerification, verifyEmail };
