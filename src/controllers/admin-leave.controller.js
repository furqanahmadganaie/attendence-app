import {
  changeAdminLeaveStatus,
  getAdminLeaveRequests
} from "../services/admin-leave.service.js";

const sendErrorResponse = (res, error) => {
  const statusCode = error?.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message
  });
};

export const listAdminLeaves = async (req, res) => {
  try {
    const status = req.validatedQuery?.status;
    const result = await getAdminLeaveRequests({ status });
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateAdminLeaveStatus = async (req, res) => {
  try {
    const leaveId = Number.parseInt(String(req.params.id), 10);
    const approvedBy = req.auth.sub;
    const { status } = req.validatedBody;

    if (!Number.isInteger(leaveId) || leaveId <= 0) {
      return res.status(400).json({
        message: "Invalid leave id"
      });
    }

    const result = await changeAdminLeaveStatus({
      leaveId,
      status,
      approvedBy
    });

    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
