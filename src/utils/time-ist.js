const IST_TIME_ZONE = "Asia/Kolkata";

const getParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return map;
};

export const formatIstDateTime = (date) => {
  const parts = getParts(date);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
};

export const formatIstTime24 = (date) => {
  const parts = getParts(date);
  return `${parts.hour}:${parts.minute}`;
};

export const formatIstDateTime12 = (date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).formatToParts(date);

  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  const dayPeriod = (map.dayPeriod || "").toUpperCase();
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} ${dayPeriod}`;
};

export const getIstHourMinute = () => {
  const parts = getParts(new Date());
  return {
    hour: Number.parseInt(parts.hour, 10),
    minute: Number.parseInt(parts.minute, 10)
  };
};

export const getIstDateString = () => {
  const parts = getParts(new Date());
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const getIstDayOfWeek = () => {
  // Compute day-of-week in IST by formatting date in IST and parsing it.
  const parts = getParts(new Date());
  const iso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+05:30`;
  return new Date(iso).getDay(); // 0 Sun .. 6 Sat
};
