import {
  applyLeave,
  getMyLeaves
} from "../services/leave.service.js";

const sendErrorResponse = (res, error) => {
  const statusCode = error?.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message
  });
};

export const applyForLeave = async (req, res) => {
  try {
    const employeeId = req.auth.sub;
    const { leaveType, startDate, endDate } = req.validatedBody;

    const result = await applyLeave({
      employeeId,
      leaveType,
      startDate,
      endDate
    });

    return res.status(201).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const listMyLeaves = async (req, res) => {
  try {
    const employeeId = req.auth.sub;
    const result = await getMyLeaves(employeeId);
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
