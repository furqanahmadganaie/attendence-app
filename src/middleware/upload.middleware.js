import multer from "multer";

const MAX_PROFILE_PIC_BYTES = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_PROFILE_PIC_BYTES }
}).single("profile");

export const uploadProfilePicture = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Profile picture must be 2MB or smaller"
      });
    }

    return res.status(400).json({
      message: "Invalid file upload"
    });
  });
};
