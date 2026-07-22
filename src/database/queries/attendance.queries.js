export const FIND_OPEN_SESSION_BY_EMPLOYEE_ID_QUERY = `
  SELECT id, employee_id, check_in_wifi_id, check_out_wifi_id, check_in, check_out
  FROM attendance_sessions
  WHERE employee_id = ? AND check_out IS NULL
  ORDER BY check_in DESC
  LIMIT 1
`;

export const INSERT_CHECK_IN_QUERY = `
  INSERT INTO attendance_sessions (employee_id, check_in, check_in_wifi_id)
  VALUES (?, ?, ?)
`;

export const UPDATE_CHECK_OUT_BY_ID_QUERY = `
  UPDATE attendance_sessions
  SET check_out = ?, check_out_wifi_id = ?
  WHERE id = ?
`;

export const FIND_SESSION_BY_ID_QUERY = `
  SELECT id, employee_id, check_in_wifi_id, check_out_wifi_id, check_in, check_out
  FROM attendance_sessions
  WHERE id = ?
  LIMIT 1
`;

export const FIND_SESSIONS_BY_EMPLOYEE_ID_FOR_DATE_QUERY = `
  SELECT id, employee_id, check_in_wifi_id, check_out_wifi_id, check_in, check_out
  FROM attendance_sessions
  WHERE employee_id = ? AND DATE(check_in) = ?
  ORDER BY check_in DESC
`;

export const FIND_SESSIONS_BY_EMPLOYEE_ID_IN_RANGE_QUERY = `
  SELECT id, employee_id, check_in_wifi_id, check_out_wifi_id, check_in, check_out
  FROM attendance_sessions
  WHERE employee_id = ? AND check_in >= ? AND check_in < ?
  ORDER BY check_in ASC
`;
