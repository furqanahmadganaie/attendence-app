import db from "../db.js";
import {
  CREATE_LEAVE_QUERY,
  FIND_LEAVE_BY_ID_QUERY,
  FIND_APPROVED_LEAVES_BY_EMPLOYEE_ID_IN_RANGE_QUERY,
  FIND_LEAVES_BY_EMPLOYEE_ID_QUERY
} from "../queries/leave.queries.js";

export const createLeave = async (
  { employeeId, leaveType, startDate, endDate },
  executor = db
) => {
  const [result] = await executor.execute(CREATE_LEAVE_QUERY, [
    employeeId,
    leaveType,
    startDate,
    endDate
  ]);

  const [rows] = await executor.execute(FIND_LEAVE_BY_ID_QUERY, [result.insertId]);
  return rows[0] ?? null;
};

export const findLeavesByEmployeeId = async (employeeId, executor = db) => {
  const [rows] = await executor.execute(FIND_LEAVES_BY_EMPLOYEE_ID_QUERY, [
    employeeId
  ]);

  return rows;
};

export const findApprovedLeavesByEmployeeIdInRange = async (
  employeeId,
  startDate,
  endDate,
  executor = db
) => {
  const [rows] = await executor.execute(
    FIND_APPROVED_LEAVES_BY_EMPLOYEE_ID_IN_RANGE_QUERY,
    [employeeId, endDate, startDate]
  );

  return rows;
};
