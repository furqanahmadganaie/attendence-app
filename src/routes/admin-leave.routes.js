import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  listAdminLeaves,
  updateAdminLeaveStatus
} from "../controllers/admin-leave.controller.js";
import {
  validateAdminLeaveQuery,
  validateAdminLeaveStatusUpdate
} from "../validators/admin-leave.validator.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireAdmin,
  validateAdminLeaveQuery,
  listAdminLeaves
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validateAdminLeaveStatusUpdate,
  updateAdminLeaveStatus
);

export default router;
