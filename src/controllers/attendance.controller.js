import {
  getAttendanceSummary,
  getAttendanceStatus,
  getTodayAttendanceSessions,
  performCheckIn,
  performCheckOut
} from "../services/attendance.service.js";

const sendErrorResponse = (res, error) => {
  const statusCode = error?.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message
  });
};

export const checkIn = async (req, res) => {
  try {
    const employeeId = req.auth.sub; // reads numeric employees.id
    const { bssid } = req.validatedBody;
    const result = await performCheckIn(employeeId, bssid);
    return res.status(201).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const checkOut = async (req, res) => {
  try {
    const employeeId = req.auth.sub; // numeric employees.id
    const { bssid } = req.validatedBody;
    const result = await performCheckOut(employeeId, bssid);
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getStatus = async (req, res) => {
  try {
    const employeeId = req.auth.sub; // numeric employees.id
    const result = await getAttendanceStatus(employeeId);
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
}; // what is the current attendance status of the employee (checked in or not, and if checked in, the check-in time)

export const getTodaySessions = async (req, res) => {
  try {
    const employeeId = req.auth.sub; // numeric employees.id
    const date = req.query?.date;

    if (date !== undefined) {
      const isValidDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);

      if (!isValidDate) {
        return res.status(400).json({
          message: "Invalid date. Use YYYY-MM-DD"
        });
      }
    } 

    const result = await getTodayAttendanceSessions(employeeId, date);
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};  // get all check-in and check-out sessions for the employee for a specific date (default to today if no date provided)


export const getSummary = async (req, res) => {
  try {
    const weekStart = req.query?.weekStart;
    const employeeIdQuery = req.query?.employeeId;

    if (weekStart !== undefined) {
      const isValidDate =
        typeof weekStart === "string" && /^\d{4}-\d{2}-\d{2}$/.test(weekStart);

      if (!isValidDate) {
        return res.status(400).json({
          message: "Invalid weekStart. Use YYYY-MM-DD"
        });
      }
    }

    let employeeId = req.auth.sub;

    if (employeeIdQuery !== undefined) {
      employeeId = Number.parseInt(String(employeeIdQuery), 10);

      if (!Number.isInteger(employeeId) || employeeId <= 0) {
        return res.status(400).json({
          message: "Invalid employeeId"
        });
      }

      if (employeeId !== req.auth.sub && !req.auth.isAdmin) {
        return res.status(403).json({
          message: "Admin access required to view another employee summary"
        });
      }
    }

    const result = await getAttendanceSummary(employeeId, weekStart);
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
}; // get attendance summary for a week, but only count totals up to the present day for the current week
