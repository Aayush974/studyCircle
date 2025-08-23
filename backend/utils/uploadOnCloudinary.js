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
    console.log(error)
    return null;
  } finally {
    fs.unlinkSync(localFilePath);
  }
};

export default uploadOnCloudinary