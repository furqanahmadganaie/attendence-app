import db from "../db.js";
import {
  buildUpdatePasswordQuery,
  buildCreateEmployeeQuery,
  FIND_USER_BY_EMAIL_QUERY,
  FIND_USER_BY_ID_QUERY,
  SHOW_EMPLOYEE_COLUMNS_QUERY,
  UPDATE_EMPLOYEE_ID_QUERY
} from "../queries/auth.queries.js";
import { createEmployeeId } from "../../utils/auth-user.js";

let cachedPasswordColumnName;

const createStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createTemporaryEmployeeId = () => `TEMP-${Date.now()}`;

export const findUserByEmail = async (email, executor = db) => {
  const [rows] = await executor.execute(FIND_USER_BY_EMAIL_QUERY, [email]);
  return rows[0] || null;
}; // Function to find a user by their email address. It executes the FIND_USER_BY_EMAIL_QUERY and returns the first matching user or null if not found.

export const findUserById = async (id, executor = db) => {
  const [rows] = await executor.execute(FIND_USER_BY_ID_QUERY, [id]);
  return rows[0] || null;
};

export const getPasswordColumnName = async (executor = db) => {
  if (executor === db && cachedPasswordColumnName) {
    return cachedPasswordColumnName;
  }

  const [columns] = await executor.execute(SHOW_EMPLOYEE_COLUMNS_QUERY);
  const columnNames = columns.map((column) => column.Field);

  if (columnNames.includes("password")) {
    if (executor === db) {
      cachedPasswordColumnName = "password";
    }

    return "password";
  }

  if (columnNames.includes("password_hash")) {
    if (executor === db) {
      cachedPasswordColumnName = "password_hash";
    }

    return "password_hash";
  }

  throw createStatusError("Employees table must contain a password column", 500);
};

export const updateUserPassword = async (
  userId,
  passwordHash,
  executor = db
) => {
  const passwordColumnName = await getPasswordColumnName(executor);
  await executor.execute(buildUpdatePasswordQuery(passwordColumnName), [
    passwordHash,
    userId
  ]);
};

export const createEmployee = async ({ name, email, passwordHash }) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const existingUser = await findUserByEmail(email, connection);

    if (existingUser) {
      throw createStatusError("An account with this email already exists", 409);
    }

    const passwordColumnName = await getPasswordColumnName(connection);// Determine the password column name to use in the insert query
    const temporaryEmployeeId = createTemporaryEmployeeId();// Generate a temporary employee ID to satisfy the NOT NULL constraint during insertion

    const [insertResult] = await connection.execute(
      buildCreateEmployeeQuery(passwordColumnName),
      [temporaryEmployeeId, name, email, passwordHash]
    );

    const employeeId = createEmployeeId(insertResult.insertId);// Generate the final employee ID based on the inserted user's ID

    await connection.execute(UPDATE_EMPLOYEE_ID_QUERY, [
      employeeId,
      insertResult.insertId
    ]);// Update the employee record with the final employee ID

    await connection.commit();// Commit the transaction before loading the created user

    const createdUser = await findUserById(insertResult.insertId);// Load the created user to return in the response

    if (!createdUser) {
      throw createStatusError("User created but could not be loaded", 500);
    }

    return createdUser;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback errors so the main database error is returned.
    }

    if (error.code === "ER_DUP_ENTRY") {
      throw createStatusError("An account with this email already exists", 409);
    }

    throw error;
  } finally {
    connection.release();
  }
};
