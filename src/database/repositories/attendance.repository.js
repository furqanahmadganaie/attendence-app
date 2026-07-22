import db from "../db.js";
import {
  FIND_OPEN_SESSION_BY_EMPLOYEE_ID_QUERY,
  FIND_SESSIONS_BY_EMPLOYEE_ID_IN_RANGE_QUERY,
  FIND_SESSIONS_BY_EMPLOYEE_ID_FOR_DATE_QUERY,
  FIND_SESSION_BY_ID_QUERY,
  INSERT_CHECK_IN_QUERY,
  UPDATE_CHECK_OUT_BY_ID_QUERY
} from "../queries/attendance.queries.js";

const createStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const findOpenSessionByEmployeeId = async (employeeId, executor = db) => {
  const [rows] = await executor.execute(FIND_OPEN_SESSION_BY_EMPLOYEE_ID_QUERY, [
    employeeId
  ]);

  return rows[0] || null;
};

export const createSession = async (
  { employeeId, checkInAt, checkInWifiId },
  executor = db
) => {
  const [insertResult] = await executor.execute(INSERT_CHECK_IN_QUERY, [
    employeeId,
    checkInAt,
    checkInWifiId ?? null
  ]);

  const session = await findSessionById(insertResult.insertId, executor);

  if (!session) {
    throw createStatusError("Session created but could not be loaded", 500);
  }

  return session;
};

export const closeSessionById = async (
  sessionId,
  checkOutAt,
  checkOutWifiId,
  executor = db
) => {
  await executor.execute(UPDATE_CHECK_OUT_BY_ID_QUERY, [
    checkOutAt,
    checkOutWifiId ?? null,
    sessionId
  ]);

  const session = await findSessionById(sessionId, executor);

  if (!session) {
    throw createStatusError("Session updated but could not be loaded", 500);
  }

  if (!session.check_out) {
    throw createStatusError("Failed to check out", 500);
  }

  return session;
};

export const findSessionById = async (sessionId, executor = db) => {
  const [rows] = await executor.execute(FIND_SESSION_BY_ID_QUERY, [sessionId]);
  return rows[0] || null;
};

export const findSessionsByEmployeeIdForDate = async (employeeId, date, executor = db) => {
  const [rows] = await executor.execute(
    FIND_SESSIONS_BY_EMPLOYEE_ID_FOR_DATE_QUERY,
    [employeeId, date]
  );

  return rows;
};

export const findSessionsByEmployeeIdInRange = async (
  employeeId,
  startDateTime,
  endDateTime,
  executor = db
) => {
  const [rows] = await executor.execute(
    FIND_SESSIONS_BY_EMPLOYEE_ID_IN_RANGE_QUERY,
    [employeeId, startDateTime, endDateTime]
  );

  return rows;
};
