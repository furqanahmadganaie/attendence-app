import db from "../db.js";
import {
  FIND_ALL_LEAVE_REQUESTS_QUERY,
  FIND_LEAVE_REQUEST_BY_ID_QUERY,
  FIND_LEAVE_REQUESTS_BY_STATUS_QUERY,
  UPDATE_LEAVE_REQUEST_STATUS_QUERY
} from "../queries/admin-leave.queries.js";

export const findAllLeaveRequests = async (status, executor = db) => {
  const query = status
    ? FIND_LEAVE_REQUESTS_BY_STATUS_QUERY
    : FIND_ALL_LEAVE_REQUESTS_QUERY;
  const params = status ? [status] : [];
  const [rows] = await executor.execute(query, params);
  return rows;
};

export const findLeaveRequestById = async (leaveId, executor = db) => {
  const [rows] = await executor.execute(FIND_LEAVE_REQUEST_BY_ID_QUERY, [leaveId]);
  return rows[0] ?? null;
};

export const updateLeaveRequestStatus = async (
  { leaveId, status, approvedBy },
  executor = db
) => {
  await executor.execute(UPDATE_LEAVE_REQUEST_STATUS_QUERY, [
    status,
    approvedBy,
    leaveId
  ]);

  const [rows] = await executor.execute(FIND_LEAVE_REQUEST_BY_ID_QUERY, [leaveId]);
  return rows[0] ?? null;
};
