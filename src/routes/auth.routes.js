import express from "express";
import { login, register, verifyRegistration} from "../controllers/auth.controller.js";

import { validateLogin,validateRegistrationOtpVerification,validateRegistrationRequest} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validateRegistrationRequest, register);
router.post("/register/verify-otp",validateRegistrationOtpVerification,verifyRegistration);
router.post("/login", validateLogin, login);

export default router;
