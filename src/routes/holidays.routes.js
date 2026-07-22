import express from "express";
import { listHolidays, syncHolidays } from "../controllers/holidays.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateHolidaysQuery, validateHolidaysSync } from "../validators/holidays.validator.js";

const router = express.Router();

// Read ONLY from DB (no external API calls here).
router.get("/", validateHolidaysQuery, listHolidays);

// Manual sync (uses Calendarific API) - keep protected so only you/admin can trigger.
router.post("/sync", requireAuth, validateHolidaysSync, syncHolidays);

export default router;

