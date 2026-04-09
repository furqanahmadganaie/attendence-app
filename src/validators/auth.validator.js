import { validateRequest } from "../middleware/validate-request.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpPattern = /^\d{6}$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const validateLogin = validateRequest({
  email: {
    required: true,
    requiredMessage: "Email is required",
    type: "string",
    typeMessage: "Email must be a string",
    trim: true,
    disallowEmpty: true,
    emptyMessage: "Email is required",
    maxLength: 254,
    maxLengthMessage: "Email must not exceed 254 characters",
    pattern: emailPattern,
    patternMessage: "Please provide a valid email address",
    toLowerCase: true
  },
  password: {
    required: true,
    requiredMessage: "Password is required",
    type: "string",
    typeMessage: "Password must be a string",
    disallowEmpty: true,
    emptyMessage: "Password is required",
    maxLength: 128,
    maxLengthMessage: "Password must not exceed 128 characters"
  }
});

export const validateRegistrationRequest = validateRequest({
  email: {
    required: true,
    requiredMessage: "Email is required",
    type: "string",
    typeMessage: "Email must be a string",
    trim: true,
    disallowEmpty: true,
    emptyMessage: "Email is required",
    maxLength: 254,
    maxLengthMessage: "Email must not exceed 254 characters",
    pattern: emailPattern,
    patternMessage: "Please provide a valid email address",
    toLowerCase: true
  },
  password: {
    required: true,
    requiredMessage: "Password is required",
    type: "string",
    typeMessage: "Password must be a string",
    disallowEmpty: true,
    emptyMessage: "Password is required",
    minLength: 8,
    minLengthMessage: "Password must be at least 8 characters long",
    maxLength: 72,
    maxLengthMessage: "Password must not exceed 72 characters",
    pattern: strongPasswordPattern,
    patternMessage:
      "Password must include uppercase, lowercase, number, and special character"
  }
});

export const validateRegistrationOtpVerification = validateRequest({
  email: {
    required: true,
    requiredMessage: "Email is required",
    type: "string",
    typeMessage: "Email must be a string",
    trim: true,
    disallowEmpty: true,
    emptyMessage: "Email is required",
    maxLength: 254,
    maxLengthMessage: "Email must not exceed 254 characters",
    pattern: emailPattern,
    patternMessage: "Please provide a valid email address",
    toLowerCase: true
  },
  otp: {
    required: true,
    requiredMessage: "OTP is required",
    type: "string",
    typeMessage: "OTP must be a string",
    trim: true,
    disallowEmpty: true,
    emptyMessage: "OTP is required",
    pattern: otpPattern,
    patternMessage: "OTP must be a 6 digit code"
  }
});
