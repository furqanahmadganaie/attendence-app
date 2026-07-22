const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value) =>
  typeof value === "string" && datePattern.test(value);

export const validateApplyLeave = (req, res, next) => {
  const leaveType = String(req.body?.leaveType ?? "").trim();
  const startDate = String(req.body?.startDate ?? "").trim();
  const endDate = String(req.body?.endDate ?? "").trim();

  if (!leaveType) {
    return res.status(400).json({
      message: "leaveType is required"
    });
  }

  if (!isValidDate(startDate)) {
    return res.status(400).json({
      message: "startDate must be YYYY-MM-DD"
    });
  }

  if (!isValidDate(endDate)) {
    return res.status(400).json({
      message: "endDate must be YYYY-MM-DD"
    });
  }

  req.validatedBody = {
    ...(req.validatedBody || {}),
    leaveType,
    startDate,
    endDate
  };

  return next();
};
