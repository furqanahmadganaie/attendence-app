-- Password reset OTP storage (recommended for production: store OTP hash, never plaintext).
-- Run this once on your MySQL DB.

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  resend_available_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_reset_otps_user_active (user_id, used_at),
  CONSTRAINT fk_password_reset_otps_user
    FOREIGN KEY (user_id) REFERENCES employees(id)
      ON DELETE CASCADE
);
