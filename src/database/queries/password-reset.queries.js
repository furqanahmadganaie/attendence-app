export const FIND_ACTIVE_RESET_OTP_QUERY = `
  SELECT *
  FROM password_reset_otps
  WHERE user_id = ? AND used_at IS NULL
  ORDER BY id DESC
  LIMIT 1
`;

export const DELETE_RESET_OTPS_FOR_USER_QUERY = `
  DELETE FROM password_reset_otps
  WHERE user_id = ?
`;

export const INSERT_RESET_OTP_QUERY = `
  INSERT INTO password_reset_otps (
    user_id,
    otp_hash,
    expires_at,
    resend_available_at,
    attempts
  )
  VALUES (?, ?, ?, ?, 0)
`;

export const INCREMENT_RESET_OTP_ATTEMPTS_QUERY = `
  UPDATE password_reset_otps
  SET attempts = attempts + 1
  WHERE id = ?
`;

export const MARK_RESET_OTP_USED_QUERY = `
  UPDATE password_reset_otps
  SET used_at = ?
  WHERE id = ?
`;
