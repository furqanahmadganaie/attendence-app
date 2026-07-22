import {
  findProfilePictureByUserId,
  updateProfilePicture
} from "../database/repositories/profile.repository.js";

const createStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sendErrorResponse = (res, error) => {
  const statusCode = error?.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message
  });
};

export const uploadMyProfilePicture = async (req, res) => {
  try {
    const userId = req.auth.sub; // numeric employees.id

    if (!req.file) {
      throw createStatusError("No file uploaded (field name must be 'profile')", 400);
    }

    const mimeType = req.file.mimetype || ""; // Default to empty string if mimetype is missing
    //what is mimetype? It is a string that indicates the type of file being uploaded, such as "image/jpeg" for JPEG images or "image/png" for PNG images. This check ensures that only image files are accepted for profile pictures.

    if (!mimeType.startsWith("image/")) {
      throw createStatusError("Only image files are allowed", 400);
    }

    const pictureBuffer = req.file.buffer;// The buffer contains the binary data of the uploaded file, which can be stored in the database or file storage system. This allows the application to save and retrieve the profile picture as needed.

    if (!pictureBuffer || pictureBuffer.length === 0) {
      throw createStatusError("Uploaded file is empty", 400);
    }

    const updated = await updateProfilePicture(
      userId,
      pictureBuffer,
      mimeType
    ); // This function updates the user's profile picture in the database. 
    // It takes the user ID, the binary data of the uploaded image, and its MIME type as parameters. 
    // The function returns a boolean indicating whether the update was successful (i.e., whether 
    // a user with the given ID was found and updated). If no user is found, it throws a 404 error.

    if (!updated) {
      throw createStatusError("User not found", 404);
    }

    // Updating the row replaces the previous image automatically.
    return res.status(200).json({
      message: "Profile picture updated"
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getMyProfilePicture = async (req, res) => {
  try {
    const userId = req.auth.sub; // numeric employees.id
    const record = await findProfilePictureByUserId(userId);

    if (!record || !record.profile_pic) {
      return res.status(404).json({ message: "No profile picture" });
    }

    const contentType = record.profile_pic_type || "application/octet-stream";
    res.set("Content-Type", contentType);
    return res.status(200).send(record.profile_pic);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

