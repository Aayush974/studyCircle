import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// after storing images locally they are stored in cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    const uploadedFileData = await cloudinary.uploader.upload(localFilePath, {
      folder: "avatars",
      resource_type: "auto",
    });
    return uploadedFileData;
  } catch (error) {
    throw new ApiError(
      error.http_code || 500,
      error.message || "Cloudinary upload failed"
    );
  } finally {
    fs.unlinkSync(localFilePath);
  }
};

export const deleteFromCloudinary = async function (publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok") {
      throw new ApiError(400, `Failed to delete asset: ${result.result}`);
    }

    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", {
      http_code: error.http_code,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    throw new ApiError(
      error.http_code || 500,
      error.message || "Cloudinary delete failed"
    );
  }
};

// this is a function to get the public id of cloudinary from the url of the image saved in the db
export const getPublicIdFromUrl = function (url) {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    const path = parts[1]; // e.g. v1695113871/avatars/abc123.jpg
    const withoutVersion = path.substring(path.indexOf("/") + 1); // remove v1695113871/
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, ""); // strip .jpg, .png, etc.

    return withoutExtension; // e.g. "avatars/abc123"
  } catch (err) {
    return null;
  }
};

export default uploadOnCloudinary;
