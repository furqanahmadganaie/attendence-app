import bcrypt from "bcrypt";
import db from "../config/db.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import {generateOtpCode,getOtpExpirationDate,hashOtpCode,isDateExpired} from "../utils/otp.js";
import { sendRegistrationOtpEmail } from "./email.service.js";

const OTP_TABLE_NAME = "email_verification_otps";
const bcryptHashPattern = /^\$2[aby]\$\d{2}\$.{53}$/;
const sensitiveFields = [
  "password",
  "password_hash",
  "reset_token",
  "refresh_token"
];

const FIND_EMPLOYEE_BY_EMAIL_QUERY =
  "SELECT * FROM employees WHERE LOWER(email) = LOWER(?) LIMIT 1";
const FIND_PENDING_REGISTRATION_QUERY = `
  SELECT email, password_hash, otp_hash, expires_at, verification_attempts, last_sent_at
  FROM ${OTP_TABLE_NAME}
  WHERE LOWER(email) = LOWER(?)
  LIMIT 1
`;
const UPSERT_PENDING_REGISTRATION_QUERY = `
  INSERT INTO ${OTP_TABLE_NAME}
    (email, password_hash, otp_hash, expires_at, verification_attempts, last_sent_at)
  VALUES
    (?, ?, ?, ?, 0, ?)
  ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    otp_hash = VALUES(otp_hash),
    expires_at = VALUES(expires_at),
    verification_attempts = 0,
    last_sent_at = VALUES(last_sent_at),
    updated_at = CURRENT_TIMESTAMP
`;
const DELETE_PENDING_REGISTRATION_QUERY = `
  DELETE FROM ${OTP_TABLE_NAME}
  WHERE LOWER(email) = LOWER(?)
`;
const INCREMENT_OTP_ATTEMPTS_QUERY = `
  UPDATE ${OTP_TABLE_NAME}
  SET verification_attempts = verification_attempts + 1
  WHERE LOWER(email) = LOWER(?)
`;
const CREATE_OTP_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS ${OTP_TABLE_NAME} (
    email VARCHAR(255) NOT NULL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    otp_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    verification_attempts INT UNSIGNED NOT NULL DEFAULT 0,
    last_sent_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_verification_otps_expires_at (expires_at)
  )
`;
let employeePasswordColumn;
const EMPLOYEE_ID_PREFIX = "EMP";

const isBcryptHash = (value) =>
  typeof value === "string" && bcryptHashPattern.test(value);

const sanitizeUser = (user) => {
  const sanitizedUser = { ...user };

  sensitiveFields.forEach((field) => {
    delete sanitizedUser[field];
  });

  return sanitizedUser;
};

const createDisplayNameFromEmail = (email) => {
  const emailPrefix = email.split("@")[0] || "user";

  const normalizedName = emailPrefix
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedName) {
    return "User";
  }

  return normalizedName
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
    .slice(0, 100);
};

const createTemporaryEmployeeId = () =>
  `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmployeeIdFromInsertId = (insertId) =>
  `${EMPLOYEE_ID_PREFIX}${String(insertId).padStart(3, "0")}`;

const verifyPassword = async (plainPassword, storedPassword) => {
  if (typeof storedPassword !== "string" || storedPassword.length === 0) {
    return false;
  }

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return plainPassword === storedPassword;
};

const getEmployeeByEmail = async (email, executor = db) => {
  const [rows] = await executor.execute(FIND_EMPLOYEE_BY_EMAIL_QUERY, [email]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

const getEmployeePasswordColumn = async (executor = db) => {
  if (executor === db && employeePasswordColumn) {
    return employeePasswordColumn;
  }

  const [columns] = await executor.execute("SHOW COLUMNS FROM employees");
  const availableColumns = new Set(columns.map((column) => column.Field));
  const resolvedPasswordColumn = availableColumns.has("password_hash")
    ? "password_hash"
    : availableColumns.has("password")
      ? "password"
      : null;

  if (!resolvedPasswordColumn) {
    throw new AppError(
      "Employees table must contain either a password or password_hash column",
      500
    );
  }

  if (executor === db) {
    employeePasswordColumn = resolvedPasswordColumn;
  }

  return resolvedPasswordColumn;
};

const getPendingRegistrationByEmail = async (email, executor = db) => {
  const [rows] = await executor.execute(FIND_PENDING_REGISTRATION_QUERY, [email]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

const deletePendingRegistration = async (email, executor = db) => {
  await executor.execute(DELETE_PENDING_REGISTRATION_QUERY, [email]);
};

const getRemainingResendSeconds = (lastSentAt) => {
  const lastSentTimestamp = new Date(lastSentAt).getTime();
  const elapsedSeconds = Math.floor((Date.now() - lastSentTimestamp) / 1000);

  return Math.max(0, env.otpResendIntervalSeconds - elapsedSeconds);
};

export const ensureAuthInfrastructure = async () => {
  await db.execute(CREATE_OTP_TABLE_QUERY);
};

export const loginUser = async ({ email, password }) => {
  const user = await getEmployeeByEmail(email);

  if (!user) {
    return null;
  }

  const storedPassword = user.password ?? user.password_hash;
  const isPasswordValid = await verifyPassword(password, storedPassword);

  if (!isPasswordValid) {
    return null;
  }

  return sanitizeUser(user);
};

export const requestRegistrationOtp = async ({ email, password }) => {
  const existingEmployee = await getEmployeeByEmail(email);

  if (existingEmployee) {
    throw new AppError("An account with this email already exists", 409);
  }

  const existingPendingRegistration = await getPendingRegistrationByEmail(email);

  if (existingPendingRegistration) {
    const resendSeconds = getRemainingResendSeconds(
      existingPendingRegistration.last_sent_at
    );

    if (resendSeconds > 0) {
      throw new AppError(
        `Please wait ${resendSeconds} seconds before requesting a new OTP`,
        429
      );
    }
  }

  const otp = generateOtpCode();
  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const otpHash = hashOtpCode(otp);
  const expiresAt = getOtpExpirationDate(env.otpExpiresInMinutes);
  const requestedAt = new Date();

  await db.execute(UPSERT_PENDING_REGISTRATION_QUERY, [
    email,
    passwordHash,
    otpHash,
    expiresAt,
    requestedAt
  ]);

  try {
    await sendRegistrationOtpEmail({ email, otp });
  } catch (error) {
    await deletePendingRegistration(email);
    throw error;
  }

  return {
    message: "Registration OTP sent successfully"
  };
};

export const verifyRegistrationOtp = async ({ email, otp }) => {
  const pendingRegistration = await getPendingRegistrationByEmail(email);

  if (!pendingRegistration) {
    throw new AppError("No pending registration found for this email", 404);
  }

  if (pendingRegistration.verification_attempts >= env.otpMaxAttempts) {
    await deletePendingRegistration(email);
    throw new AppError(
      "Too many invalid OTP attempts. Please request a new OTP",
      429
    );
  }

  if (isDateExpired(pendingRegistration.expires_at)) {
    await deletePendingRegistration(email);
    throw new AppError("OTP has expired. Please request a new OTP", 400);
  }

  if (hashOtpCode(otp) !== pendingRegistration.otp_hash) {
    await db.execute(INCREMENT_OTP_ATTEMPTS_QUERY, [email]);
    throw new AppError("Invalid OTP", 400);
  }

  const connection = await db.getConnection();
  let transactionError;

  try {
    await connection.beginTransaction();

    const existingEmployee = await getEmployeeByEmail(email, connection);
    const employeePasswordColumnName = await getEmployeePasswordColumn(connection);

    if (existingEmployee) {
      throw new AppError("An account with this email already exists", 409);
    }

    const displayName = createDisplayNameFromEmail(email);
    const temporaryEmployeeId = createTemporaryEmployeeId();

    const [insertResult] = await connection.execute(
      `
        INSERT INTO employees (employeeId, name, email, ${employeePasswordColumnName})
        VALUES (?, ?, ?, ?)
      `,
      [
        temporaryEmployeeId,
        displayName,
        email,
        pendingRegistration.password_hash
      ]
    );

    await connection.execute(
      "UPDATE employees SET employeeId = ? WHERE id = ?",
      [createEmployeeIdFromInsertId(insertResult.insertId), insertResult.insertId]
    );
    await deletePendingRegistration(email, connection);

    await connection.commit();
  } catch (error) {
    await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      transactionError = new AppError(
        "An account with this email already exists",
        409
      );
    } else {
      transactionError = error;
    }
  } finally {
    connection.release();
  }

  if (transactionError) {
    if (transactionError instanceof AppError && transactionError.statusCode === 409) {
      await deletePendingRegistration(email);
    }

    throw transactionError;
  }

  const createdUser = await getEmployeeByEmail(email);

  return sanitizeUser(createdUser ?? { email });
};
