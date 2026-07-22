import db from "../db.js";
import {
  DELETE_RESET_OTPS_FOR_USER_QUERY,
  FIND_ACTIVE_RESET_OTP_QUERY,
  INCREMENT_RESET_OTP_ATTEMPTS_QUERY,
  INSERT_RESET_OTP_QUERY,
  MARK_RESET_OTP_USED_QUERY
} from "../queries/password-reset.queries.js";

export const findActivePasswordResetOtp = async (userId, executor = db) => {
  const [rows] = await executor.execute(FIND_ACTIVE_RESET_OTP_QUERY, [userId]);
  return rows[0] || null;
};

export const replacePasswordResetOtp = async (
  { userId, otpHash, expiresAt, resendAvailableAt },
  executor = db
) => {
  await executor.execute(DELETE_RESET_OTPS_FOR_USER_QUERY, [userId]);

  const [insertResult] = await executor.execute(INSERT_RESET_OTP_QUERY, [
    userId,
    otpHash,
    expiresAt,
    resendAvailableAt
  ]);

  return insertResult.insertId;
};

export const incrementPasswordResetOtpAttempts = async (otpId, executor = db) =>
  executor.execute(INCREMENT_RESET_OTP_ATTEMPTS_QUERY, [otpId]);

export const markPasswordResetOtpUsed = async (
  otpId,
  usedAt,
  executor = db
) => executor.execute(MARK_RESET_OTP_USED_QUERY, [usedAt, otpId]);
