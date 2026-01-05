import cloudinary from "../config/cloudinary/cloudinary.js";
import logger from "../utils/logger.js";

const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
    });
    return result;
  } catch (error) {
    logger.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default uploadToCloudinary;
