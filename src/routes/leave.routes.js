import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  applyForLeave,
  listMyLeaves
} from "../controllers/leave.controller.js";
import { validateApplyLeave } from "../validators/leave.validator.js";

const router = express.Router();

router.post("/apply", requireAuth, validateApplyLeave, applyForLeave);
router.get("/me", requireAuth, listMyLeaves);

export default router;
