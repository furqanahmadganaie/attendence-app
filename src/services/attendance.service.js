import {
  closeSessionById,
  createSession,
  findOpenSessionByEmployeeId,
  findSessionsByEmployeeIdForDate,
  findSessionsByEmployeeIdInRange
} from "../database/repositories/attendance.repository.js";
import { findActiveWifiByBssid } from "../database/repositories/wifi.repository.js";
import { findApprovedLeavesByEmployeeIdInRange } from "../database/repositories/leave.repository.js";
import { findHolidaysInRange } from "../database/repositories/holidays.repository.js";

import {formatIstDateTime,getIstDateString,getIstDayOfWeek,getIstHourMinute} from "../utils/time-ist.js";

const COUNTRY_IN = "IN";
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const OFFICE_START_MINUTES = 9 * 60 + 30;

const createStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureCheckInAllowed = () => {
  const dayOfWeek = getIstDayOfWeek(); // 0 Sun ... 6 Sat

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    throw createStatusError("Check-in not allowed on weekends", 400);
  } // Check-in is only allowed on weekdays (Monday to Friday).

  const { hour, minute } = getIstHourMinute();

  // Not allowed before 09:30. Allowed at 09:30 and after.
  if (hour < 9 || (hour === 9 && minute < 30)) {
    throw createStatusError("Check-in allowed only after 09:30 AM", 400);
  }
};

// Return raw DB values. When serialized to JSON, mysql2 Date values become ISO strings (with Z).
const toUiSession = (session) => {
  if (!session) {
    return null;
  }

  return {
    id: session.id,
    employee_id: session.employee_id,
    check_in_wifi_id: session.check_in_wifi_id ?? null,
    check_out_wifi_id: session.check_out_wifi_id ?? null,
    check_in: session.check_in,
    check_out: session.check_out
  };
};// Helper function to convert a session record from the database into a format suitable for the UI.

const assertAllowedWifi = async (bssid) => {
  const wifi = await findActiveWifiByBssid(bssid);

  if (!wifi) {
    throw createStatusError("Not on allowed Wi-Fi", 403);
  }

  return wifi;
}; // Helper function to check if the provided BSSID corresponds to an active and 
// allowed Wi-Fi network. Throws a 403 error if the Wi-Fi is not allowed. Returns
// the Wi-Fi record if it is allowed.

export const performCheckIn = async (employeeId, bssid) => {
  ensureCheckInAllowed();

  const wifi = await assertAllowedWifi(bssid);// Check if the employee is already checked in (i.e., has an open session).
  const openSession = await findOpenSessionByEmployeeId(employeeId); // If there is an open session, it means the employee is already checked in and cannot check in again without checking out first. Throw a 
  // 409 Conflict error in this case.

  if (openSession) {
    throw createStatusError("Already checked in", 409);
  }

  const checkInAt = formatIstDateTime(new Date());
  const createdSession = await createSession({
    employeeId,
    checkInAt,
    checkInWifiId: wifi.id
  }); // Create a new attendance session with the current timestamp as the check-in time and the ID of the allowed Wi-Fi network.

  return {
    message: "Check-in successful",
    session: toUiSession(createdSession)
  };
};

export const performCheckOut = async (employeeId, bssid) => {
  const wifi = await assertAllowedWifi(bssid);
  const openSession = await findOpenSessionByEmployeeId(employeeId);

  if (!openSession) {
    throw createStatusError("No active check-in found", 409);
  }

  const checkOutAt = formatIstDateTime(new Date());
  const updatedSession = await closeSessionById(
    openSession.id,
    checkOutAt,
    wifi.id
  ); // Update the existing open session with the current timestamp as the check-out time and the ID of the allowed Wi-Fi network.

  const workedMinutes = Math.max(
    0,
    Math.round((updatedSession.check_out - updatedSession.check_in) / 60000)
  );

  return {
    message: "Check-out successful",
    session: toUiSession(updatedSession),
    workedMinutes
  };
};

export const getTodayAttendanceSessions = async (employeeId, date) => {
  const resolvedDate = date ?? getIstDateString();
  const sessions = await findSessionsByEmployeeIdForDate(employeeId, resolvedDate);

  return {
    date: resolvedDate,
    sessions: sessions.map(toUiSession)
  };
};

export const getAttendanceStatus = async (employeeId) => {
  const date = getIstDateString();
  const openSession = await findOpenSessionByEmployeeId(employeeId);

  return {
    date,
    isCheckedIn: Boolean(openSession),
    openSession: toUiSession(openSession)
  };
};

const parseIsoDate = (value) => {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatIsoDate = (date) => date.toISOString().slice(0, 10);

const normalizeDateValue = (value) => {
  if (value instanceof Date) {
    return formatIsoDate(value);
  }

  return String(value).slice(0, 10);
};

const addDays = (date, days) => {
  const nextDate = new Date(date.getTime());
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
};

const getWeekStartDate = (weekStart) => {
  const baseDate = parseIsoDate(weekStart ?? getIstDateString());
  const dayOfWeek = baseDate.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return addDays(baseDate, diffToMonday);
};

const getDateKeyFromDateTime = (dateTime) => formatIstDateTime(dateTime).slice(0, 10);

const getHourMinuteFromDateTime = (dateTime) => {
  const time = formatIstDateTime(dateTime).slice(11, 16);
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
};

const formatMinutesAsHours = (minutes) => (minutes / 60).toFixed(2);

const enumerateDateRange = (startDate, endDate) => {
  const dates = [];

  for (let current = startDate; current <= endDate; current = addDays(current, 1)) {
    dates.push(formatIsoDate(current));
  }

  return dates;
};

export const getAttendanceSummary = async (employeeId, weekStart) => {
  const weekStartDate = getWeekStartDate(weekStart);
  const weekEndDate = addDays(weekStartDate, 4);
  const nextWeekDate = addDays(weekStartDate, 7);
  const weekStartIso = formatIsoDate(weekStartDate);
  const weekEndIso = formatIsoDate(weekEndDate);
  const todayIso = getIstDateString();


  const [sessions, approvedLeaves, holidays] = await Promise.all([
    findSessionsByEmployeeIdInRange(
      employeeId,
      `${weekStartIso} 00:00:00`,
      `${formatIsoDate(nextWeekDate)} 00:00:00`
    ),
    findApprovedLeavesByEmployeeIdInRange(employeeId, weekStartIso, weekEndIso),
    findHolidaysInRange(COUNTRY_IN, weekStartIso, weekEndIso)
  ]); // Fetch all attendance sessions for the employee that fall within the specified week, 
  // as well as any approved leaves and holidays that overlap with the week. This allows us
  //  to determine the attendance status for each day of the week, taking into account not 
  // only the check-in/check-out sessions but also any approved absences or holidays.

  const sessionsByDate = new Map();

  for (const session of sessions) {
    const dateKey = getDateKeyFromDateTime(session.check_in);
    const existingSessions = sessionsByDate.get(dateKey) || [];
    existingSessions.push(session);
    sessionsByDate.set(dateKey, existingSessions);
  }

  const leaveDateMap = new Map();

  for (const leave of approvedLeaves) {
    const leaveStartDate = normalizeDateValue(leave.start_date);
    const leaveEndDate = normalizeDateValue(leave.end_date);
    const effectiveStart = leaveStartDate > weekStartIso ? leaveStartDate : weekStartIso;
    const effectiveEnd = leaveEndDate < weekEndIso ? leaveEndDate : weekEndIso;

    for (const date of enumerateDateRange(parseIsoDate(effectiveStart), parseIsoDate(effectiveEnd))) {
      leaveDateMap.set(date, leave);
    }
  }

  const holidayDateMap = new Map(
    holidays.map((holiday) => [normalizeDateValue(holiday.holiday_date), holiday])
  );

  let presentDays = 0;
  let totalWorkedMinutes = 0;
  let totalLateMinutes = 0;
  const absentDays = [];
  const days = [];

  for (let index = 0; index < 5; index += 1) {
    const currentDate = addDays(weekStartDate, index);
    const dateKey = formatIsoDate(currentDate);
    const daySessions = (sessionsByDate.get(dateKey) || []).sort(
      (left, right) => left.check_in - right.check_in
    );
    const holiday = holidayDateMap.get(dateKey) || null;
    const leave = leaveDateMap.get(dateKey) || null;
    const isFutureDay = dateKey > todayIso;
    const shouldIncludeInSummary = !isFutureDay;

    let workedMinutes = 0;
    for (const session of daySessions) {
      const sessionEnd = session.check_out ?? new Date();
      workedMinutes += Math.max(0, Math.round((sessionEnd - session.check_in) / 60000));
    }

    let lateMinutes = 0;
    if (daySessions.length > 0) {
      const { hour, minute } = getHourMinuteFromDateTime(daySessions[0].check_in);
      lateMinutes = Math.max(0, hour * 60 + minute - OFFICE_START_MINUTES);
    }

    const isUpcoming = isFutureDay && daySessions.length === 0 && !holiday && !leave;
    const isAbsent = !isFutureDay && daySessions.length === 0 && !holiday && !leave;

    if (shouldIncludeInSummary && daySessions.length > 0) {
      presentDays += 1;
      totalWorkedMinutes += workedMinutes;
      totalLateMinutes += lateMinutes;
    }

    if (isAbsent) {
      absentDays.push({
        date: dateKey,
        dayName: WEEKDAY_NAMES[currentDate.getUTCDay()]
      });
    }

    days.push({
      date: dateKey,
      dayName: WEEKDAY_NAMES[currentDate.getUTCDay()],
      status: daySessions.length > 0
        ? "present"
        : holiday
          ? "holiday"
          : leave
            ? "leave"
            : isUpcoming
              ? "upcoming"
              : "absent",
      sessions: daySessions.map(toUiSession),
      firstCheckIn: daySessions[0] ? formatIstDateTime(daySessions[0].check_in) : null,
      lateMinutes,
      lateHours: formatMinutesAsHours(lateMinutes),
      workedMinutes,
      workedHours: formatMinutesAsHours(workedMinutes),
      holidayName: holiday?.name ?? null,
      leaveType: leave?.leave_type ?? null
    });
  }

  return {
    weekStart: weekStartIso,
    weekEnd: weekEndIso,
    employeeId,
    summary: {
      presentDays,
      absentDaysCount: absentDays.length,
      absentDays,
      totalLateMinutes,
      totalLateHours: formatMinutesAsHours(totalLateMinutes),
      totalWorkedMinutes,
      totalWorkedHours: formatMinutesAsHours(totalWorkedMinutes)
    },
    days
  };
};
