import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadProfilePicture } from "../middleware/upload.middleware.js";
import {
  getMyProfilePicture,
  uploadMyProfilePicture
} from "../controllers/profile.controller.js";

const router = express.Router();

router.post("/me/picture", requireAuth, uploadProfilePicture, uploadMyProfilePicture);
router.get("/me/picture", requireAuth, getMyProfilePicture);

export default router;

