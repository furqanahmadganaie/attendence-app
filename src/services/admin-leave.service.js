import {
  findAllLeaveRequests,
  findLeaveRequestById,
  updateLeaveRequestStatus
} from "../database/repositories/admin-leave.repository.js";

const createStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getAdminLeaveRequests = async ({ status }) => {
  const leaves = await findAllLeaveRequests(status);

  return {
    leaves
  };
};

export const changeAdminLeaveStatus = async ({ leaveId, status, approvedBy }) => {
  const existingLeave = await findLeaveRequestById(leaveId);

  if (!existingLeave) {
    throw createStatusError("Leave request not found", 404);
  }

  if (existingLeave.status !== "pending") {
    throw createStatusError("Leave request already processed", 409);
  }

  const updatedLeave = await updateLeaveRequestStatus({
    leaveId,
    status,
    approvedBy
  });

  if (!updatedLeave) {
    throw createStatusError("Leave updated but could not be loaded", 500);
  }

  return {
    message: `Leave ${status} successfully`,
    status: updatedLeave.status
  };
};
