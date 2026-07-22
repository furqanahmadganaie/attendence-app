export const fetchCalendarificHolidays = async ({ apiKey, country, year }) => {
  if (typeof fetch !== "function") {
    const error = new Error("Node.js fetch is not available. Use Node 18+ or run via Docker.");
    error.statusCode = 500;
    throw error;
  }

  if (!apiKey) {
    const error = new Error("Calendarific API key not configured");
    error.statusCode = 500;
    throw error;
  }

  const url =
    `https://calendarific.com/api/v2/holidays` +
    `?api_key=${encodeURIComponent(apiKey)}` +
    `&country=${encodeURIComponent(country)}` +
    `&year=${encodeURIComponent(year)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const error = new Error(
      `Calendarific request failed: ${response.status} ${response.statusText}`
    );
    error.statusCode = 502;
    error.details = bodyText;
    throw error;
  }

  const json = await response.json();
  const holidays = json?.response?.holidays;

  if (!Array.isArray(holidays)) {
    const error = new Error("Unexpected Calendarific response format");
    error.statusCode = 502;
    throw error;
  }

  return holidays;
};
