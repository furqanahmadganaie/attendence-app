import express from "express";
import {
  getCurrentUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  validateForgotPassword,
  validateLogin,
  validateRegistrationRequest,
  validateResetPassword
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validateRegistrationRequest, register);
router.post("/login", validateLogin, login);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
