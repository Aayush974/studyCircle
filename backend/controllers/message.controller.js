import asyncHandler from "../utils/asyncHandler.js";
import { Message } from "../models/message.model.js";
import { getMembership } from "../utils/membership.js";
import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/uploadOnCloudinary.js";
import fs from "fs";

const createMessage = asyncHandler(async (req, res) => {
  try {
    const { content, targetId, targetType } = req.body;
    const images = req.files?.images || [];
    const pdf = req.files?.pdf?.[0];

    if (!targetId || !targetType) {
      throw new ApiError(
        400,
        "please provide both the targetID and targetType"
      );
    }

    // check if target type is valid
    if (!["workspace", "room", "user"].includes(targetType)) {
      throw new ApiError(
        400,
        "invalid targetType, can only be 'workspace' 'user' and 'room'"
      );
    }

    try {
      await getMembership(targetId, req.user._id.toString());
    } catch (error) {
      throw new ApiError(
        403,
        "forbidden to create these messages. No membership found"
      );
    }

    // if no message content is there
    if (content.trim() == "" && !pdf && images.length == 0) {
      throw new ApiError(400, "no content provided in message");
    }

    const attachments = []; // used to hold the attached files meta data to be pushed to the db

    // getting pdf path if its provided
    const localPdfPath = pdf?.path;
    let uploadedPdfData;
    if (localPdfPath) {
      // upload pdf to cloudinary
      uploadedPdfData = await uploadOnCloudinary(localPdfPath, "attachments");

      // push the data to the attachments array
      attachments.push({
        fileUrl: uploadedPdfData.secure_url,
        fileType: "pdf",
        fileName: pdf.originalname,
        fileSize: pdf.size,
        publicId: uploadedPdfData.public_id,
      });
    }

    let uploadedImagesData = []; // this array is used to store the uploaded image data and delete it from cloudinary in case an error occurs

    if (images.length > 0) {
      // using promise all settled to parallely execute multiple image uploading
      const results = await Promise.allSettled(
        images.map((image) =>
          uploadOnCloudinary(image.path, "attachments").then(
            (uploadedData) => ({
              uploadedData,
              fileName: image.originalname,
              fileSize: image.size,
            })
          )
        )
      );

      // if one of the image uploads failed delete all the uploaded image and throw an error
      if (results.some((result) => result.status == "rejected")) {
        const successes = results.filter(
          (result) => result.status == "fulfilled"
        );
        await Promise.all(
          successes.map((success) =>
            deleteFromCloudinary(success.value.uploadedData.public_id)
          )
        );
        throw new ApiError(500, "one or more image uploads failed");
      }

      results
        .filter((result) => result.status == "fulfilled")
        .forEach((result) => {
          uploadedImagesData.push(result.value.uploadedData);
          attachments.push({
            fileUrl: result.value.uploadedData.secure_url,
            fileType: "image",
            fileName: result.value.fileName,
            fileSize: result.value.fileSize,
            publicId: result.value.uploadedData.public_id,
          });
        });
    }

    const newMessage = await Message.create({
      content,
      senderId: req.user._id,
      targetId,
      targetType,
      attachments,
    });

    if (!newMessage) {
      if (uploadedPdfData)
        await deleteFromCloudinary(uploadedPdfData.public_id);
      if (uploadedImagesData.length > 0)
        await Promise.all(
          uploadedImagesData.map((uploadedImage) =>
            deleteFromCloudinary(uploadedImage.public_id)
          )
        );
      throw new ApiError(
        500,
        "something went wrong while creating the message"
      );
    }

    res.status(201).json({
      status: 201,
      success: true,
      message: "the message was created",
    });
  } catch (error) {
    if (req?.files?.pdf?.[0]) fs.unlinkSync(req.files.pdf[0].path);
    if (req?.files?.images > 0) {
      req.files.images.forEach((file) => fs.unlinkSync(file.path));
    }
    throw error;
  }
});

// currently not built to check for user to user messages
const getMessage = asyncHandler(async (req, res) => {
  const { targetId, targetType, before, limit = 50 } = req.query;

  if (!targetId || !targetType) {
    throw new ApiError(400, "targetId and targetType are required");
  }

  if (!["workspace", "room", "user"].includes(targetType)) {
    throw new ApiError(
      400,
      "invalid targetType in query. can only be 'workspace' 'user' and 'room'"
    );
  }

  try {
    await getMembership(targetId, req.user._id.toString());
  } catch (error) {
    throw new ApiError(
      403,
      "forbidden to access these messages. No membership found"
    );
  }

  // filter is the query object used to query the messages
  const filter = {
    targetId,
    targetType,
  };

  // before is a special query parameter which is used when we have to fetch messages which were sent before a particular time frame since 0
  if (before) {
    const date = new Date(before);
    if (isNaN(date.getTime())) {
      throw new ApiError(400, "invalid before date");
    }
    filter.createdAt = { $lt: date };
  }

  let parseLimit = parseInt(limit, 10);
  if (isNaN(parseLimit) || parseLimit <= 0) parseLimit = 50; // default fallback in case garbage value or negative integers are entered
  const safeLimit = Math.min(parseLimit, 200); // max 200 // max limit is set to 200 for now if exceeded set the limit to default 50

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(safeLimit); // limit to 50 messages at a time

  return res.status(200).json({
    status: 200,
    success: true,
    messages: messages.reverse(), // for frontend oldest -> newest
  });
});

export { createMessage, getMessage };
