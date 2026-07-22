-- Holidays cache table (Calendarific -> MySQL)
-- Run once.

CREATE TABLE IF NOT EXISTS holidays (
  id BIGINT NOT NULL AUTO_INCREMENT,
  country CHAR(2) NOT NULL,          -- 'IN'
  year INT NOT NULL,                -- 2026
  holiday_date DATE NOT NULL,        -- 2026-01-26
  name VARCHAR(255) NOT NULL,        -- 'Republic Day'
  holiday_type VARCHAR(255) NULL,    -- comma-joined types
  description TEXT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'calendarific',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_holidays (country, holiday_date, name),
  KEY idx_holidays_year (country, year, holiday_date)
);

