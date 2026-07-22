const isValidYear = (value) => Number.isInteger(value) && value >= 2000 && value <= 2100;

export const validateHolidaysQuery = (req, res, next) => {
  const rawYear = req.query?.year;
  const parsedYear = Number.parseInt(String(rawYear ?? ""), 10);

  if (!isValidYear(parsedYear)) {
    return res.status(400).json({
      message: "year is required (YYYY)"
    });
  }

  req.validatedQuery = {
    ...(req.validatedQuery || {}),
    year: parsedYear
  };

  return next();
};

export const validateHolidaysSync = (req, res, next) => {
  const parsedYear = Number.parseInt(String(req.body?.year ?? ""), 10);

  if (!isValidYear(parsedYear)) {
    return res.status(400).json({
      message: "year is required in body (YYYY)"
    });
  }

  req.validatedBody = {
    ...(req.validatedBody || {}),
    year: parsedYear
  };

  return next();
};

