import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { findUserByEmail, updateUserPassword } from "../database/repositories/auth.repository.js";
import {
  findActivePasswordResetOtp,
  incrementPasswordResetOtpAttempts,
  markPasswordResetOtpUsed,
  replacePasswordResetOtp
} from "../database/repositories/password-reset.repository.js";
import { sendPasswordResetOtpEmail } from "../utils/mailer.js";

const createStatusError = (message, statusCode, extra = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, extra);
  return error;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const toDate = (value) => (value instanceof Date ? value : new Date(value));

export const requestPasswordResetOtp = async ({ email }) => {
  const user = await findUserByEmail(email);

  // Avoid leaking whether a user exists (production-friendly).
  if (!user) {
    return { message: "If the account exists, an OTP has been sent" };
  }

  const existing = await findActivePasswordResetOtp(user.id);

  if (existing) {
    const resendAvailableAt = toDate(existing.resend_available_at);
    const now = new Date();

    if (now < resendAvailableAt) {
      const retryAfterSeconds = Math.ceil((resendAvailableAt - now) / 1000);
      throw createStatusError("Please wait before requesting a new OTP", 429, {
        retryAfterSeconds
      });
    }
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, env.bcryptSaltRounds);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.otpExpiresMinutes * 60_000);
  const resendAvailableAt = new Date(
    now.getTime() + env.otpResendSeconds * 1000
  );

  await replacePasswordResetOtp({
    userId: user.id,
    otpHash,
    expiresAt,
    resendAvailableAt
  });

  await sendPasswordResetOtpEmail({ to: user.email, otp });

  return { message: "If the account exists, an OTP has been sent" };
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw createStatusError("Invalid OTP or expired OTP", 400);
  }

  const record = await findActivePasswordResetOtp(user.id);

  if (!record) {
    throw createStatusError("Invalid OTP or expired OTP", 400);
  }

  const now = new Date();
  const expiresAt = toDate(record.expires_at);

  if (now > expiresAt) {
    await markPasswordResetOtpUsed(record.id, now);
    throw createStatusError("Invalid OTP or expired OTP", 400);
  }

  if (record.attempts >= env.otpMaxAttempts) {
    await markPasswordResetOtpUsed(record.id, now);
    throw createStatusError("OTP attempts exceeded. Please request a new OTP.", 429);
  }

  const isMatch = await bcrypt.compare(String(otp), record.otp_hash);

  if (!isMatch) {
    await incrementPasswordResetOtpAttempts(record.id);

    const nextAttempts = record.attempts + 1;
    if (nextAttempts >= env.otpMaxAttempts) {
      await markPasswordResetOtpUsed(record.id, now);
      throw createStatusError("OTP attempts exceeded. Please request a new OTP.", 429);
    }

    throw createStatusError("Invalid OTP", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
  await updateUserPassword(user.id, passwordHash);
  await markPasswordResetOtpUsed(record.id, now);

  return { message: "Password reset successful" };
};
