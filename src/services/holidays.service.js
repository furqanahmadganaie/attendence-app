import { env } from "../config/env.js";
import { upsertHoliday, findHolidaysByYear } from "../database/repositories/holidays.repository.js";
import { fetchCalendarificHolidays } from "../utils/calendarific.js";

const COUNTRY_IN = "IN";

const normalizeHolidayType = (value) => {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean).join(",");
  }

  if (value === undefined || value === null) {
    return null;
  }

  const str = String(value).trim();
  return str || null;
};

export const syncHolidaysFromCalendarific = async ({ year, country = COUNTRY_IN }) => {
  const holidays = await fetchCalendarificHolidays({
    apiKey: env.calendarificApiKey,
    country,
    year
  });

  let savedCount = 0;

  for (const holiday of holidays) {
    const dateIso = holiday?.date?.iso; // YYYY-MM-DD
    const name = holiday?.name;

    if (!dateIso || !name) {
      continue;
    }

    await upsertHoliday({
      country,
      year,
      holidayDate: dateIso,
      name: String(name),
      holidayType: normalizeHolidayType(holiday?.type),
      description: holiday?.description ? String(holiday.description) : null
    });

    savedCount += 1;
  }

  return { message: "Holidays synced", country, year, savedCount };
};

export const getHolidaysFromDb = async ({ year, country = COUNTRY_IN }) => {
  const holidays = await findHolidaysByYear(country, year);
  return { country, year, holidays };
};

