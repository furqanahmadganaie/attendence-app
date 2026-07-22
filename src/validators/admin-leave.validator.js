export const validateAdminLeaveQuery = (req, res, next) => {
  const rawStatus = req.query?.status;

  if (rawStatus === undefined) {
    req.validatedQuery = {
      ...(req.validatedQuery || {}),
      status: undefined
    };

    return next();
  }

  const status = String(rawStatus).trim().toLowerCase();

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "status must be pending, approved or rejected"
    });
  }

  req.validatedQuery = {
    ...(req.validatedQuery || {}),
    status
  };

  return next();
};

export const validateAdminLeaveStatusUpdate = (req, res, next) => {
  const status = String(req.body?.status ?? "").trim().toLowerCase();

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "status must be approved or rejected"
    });
  }

  req.validatedBody = {
    ...(req.validatedBody || {}),
    status
  };

  return next();
};
