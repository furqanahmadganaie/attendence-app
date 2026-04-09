import {
  loginUser,
  requestRegistrationOtp,
  verifyRegistrationOtp
} from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const register = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const result = await requestRegistrationOtp({ email, password });

  res.status(200).json(result);
});

export const verifyRegistration = asyncHandler(async (req, res) => {
  const { email, otp } = req.validatedBody;
  const user = await verifyRegistrationOtp({ email, otp });

  res.status(201).json({
    message: "Registration successful",
    user
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await loginUser({ email, password });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  res.status(200).json({
    message: "Login successful",
    user
  });
});
