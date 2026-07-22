import db from "../db.js";
import {
  FIND_HOLIDAYS_IN_RANGE_QUERY,
  FIND_HOLIDAYS_BY_YEAR_QUERY,
  UPSERT_HOLIDAY_QUERY
} from "../queries/holidays.queries.js";

export const upsertHoliday = async (
  { country, year, holidayDate, name, holidayType, description },
  executor = db
) => {
  await executor.execute(UPSERT_HOLIDAY_QUERY, [
    country,
    year,
    holidayDate,
    name,
    holidayType,
    description
  ]);
};

export const findHolidaysByYear = async (country, year, executor = db) => {
  const [rows] = await executor.execute(FIND_HOLIDAYS_BY_YEAR_QUERY, [
    country,
    year
  ]);
  return rows;
};

export const findHolidaysInRange = async (
  country,
  startDate,
  endDate,
  executor = db
) => {
  const [rows] = await executor.execute(FIND_HOLIDAYS_IN_RANGE_QUERY, [
    country,
    startDate,
    endDate
  ]);
  return rows;
};
