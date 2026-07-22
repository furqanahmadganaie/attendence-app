import dotenv from "dotenv";

dotenv.config();

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

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`Environment variable must be a boolean: ${value}`);
};

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getOptionalEnv = (key, fallback = "") => process.env[key] ?? fallback;

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
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: getCorsOrigin(),
  dbHost: getRequiredEnv("DB_HOST"),
  dbUser: getRequiredEnv("DB_USER"),
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: getRequiredEnv("DB_NAME"),
  dbConnectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT, 10),
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 12),

  smtpHost: getOptionalEnv("SMTP_HOST"),
  smtpPort: parseNumber(process.env.SMTP_PORT, 587),
  smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
  smtpUser: getOptionalEnv("SMTP_USER"),
  smtpPass: getOptionalEnv("SMTP_PASS"),
  smtpFrom: getOptionalEnv("SMTP_FROM", "no-reply@centroxy.com"),

  otpExpiresMinutes: parseNumber(process.env.OTP_EXPIRES_MINUTES, 5),
  otpResendSeconds: parseNumber(process.env.OTP_RESEND_SECONDS, 60),
  otpMaxAttempts: parseNumber(process.env.OTP_MAX_ATTEMPTS, 3),

  calendarificApiKey: getOptionalEnv("CALENDARIFIC_API_KEY")
});
