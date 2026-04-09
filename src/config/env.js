import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
};

const parseNumber = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable must be a valid number: ${value}`);
  }

  return parsedValue;
};

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getCorsOrigin = () => {
  const value = process.env.CORS_ORIGIN;

  if (!value || value.trim() === "*") {
    return "*";
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = Object.freeze({
  appName: process.env.APP_NAME || "Attendance App",
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber(process.env.PORT, 5000),
  corsOrigin: getCorsOrigin(),
  dbHost: getRequiredEnv("DB_HOST"),
  dbUser: getRequiredEnv("DB_USER"),
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: getRequiredEnv("DB_NAME"),
  dbConnectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT, 10),
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  otpExpiresInMinutes: parseNumber(process.env.OTP_EXPIRES_IN_MINUTES, 10),
  otpResendIntervalSeconds: parseNumber(
    process.env.OTP_RESEND_INTERVAL_SECONDS,
    60
  ),
  otpMaxAttempts: parseNumber(process.env.OTP_MAX_ATTEMPTS, 5),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseNumber(process.env.SMTP_PORT, 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "",
  smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
  smtpConfigured: Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  )
});
