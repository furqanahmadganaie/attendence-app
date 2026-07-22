import {
  getHolidaysFromDb,
  syncHolidaysFromCalendarific
} from "../services/holidays.service.js";

const sendErrorResponse = (res, error) => {
  const statusCode = error?.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message
  });
};

export const listHolidays = async (req, res) => {
  try {
    const year = req.validatedQuery.year;
    const result = await getHolidaysFromDb({ year, country: "IN" });
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const syncHolidays = async (req, res) => {
  try {
    const year = req.validatedBody.year;
    const result = await syncHolidaysFromCalendarific({ year, country: "IN" });
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

