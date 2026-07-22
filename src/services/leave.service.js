import {
  createLeave,
  findLeavesByEmployeeId
} from "../database/repositories/leave.repository.js";

const createStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toUiLeave = (leave) => {
  if (!leave) {
    return null;
  }

  return {
    id: leave.id,
    employee_id: leave.employee_id,
    leave_type: leave.leave_type,
    start_date: leave.start_date,
    end_date: leave.end_date,
    status: leave.status,
    approved_by: leave.approved_by
  };
};

export const applyLeave = async ({ employeeId, leaveType, startDate, endDate }) => {
  if (endDate < startDate) {
    throw createStatusError("endDate cannot be before startDate", 400);
  }

  const createdLeave = await createLeave({
    employeeId,
    leaveType,
    startDate,
    endDate
  });

  if (!createdLeave) {
    throw createStatusError("Leave created but could not be loaded", 500);
  }

  return {
    message: "Leave applied successfully",
    status: createdLeave.status
  };
};

export const getMyLeaves = async (employeeId) => {
  const leaves = await findLeavesByEmployeeId(employeeId);

  return {
    leaves: leaves.map(toUiLeave)
  };
};
