import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  checkIn,
  checkOut,
  getSummary,
  getStatus,
  getTodaySessions
} from "../controllers/attendance.controller.js";
import { validateWifiBssid } from "../validators/attendance.validator.js";

const router = express.Router();

router.post("/check-in", requireAuth, validateWifiBssid, checkIn);
router.post("/check-out", requireAuth, validateWifiBssid, checkOut);
router.get("/status", requireAuth, getStatus);
router.get("/today", requireAuth, getTodaySessions);
router.get("/summary", requireAuth, getSummary);

export default router;
