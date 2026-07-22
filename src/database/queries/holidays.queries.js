export const UPSERT_HOLIDAY_QUERY = `
  INSERT INTO holidays (
    country,
    year,
    holiday_date,
    name,
    holiday_type,
    description,
    source
  )
  VALUES (?, ?, ?, ?, ?, ?, 'calendarific')
  ON DUPLICATE KEY UPDATE
    holiday_type = VALUES(holiday_type),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP
`;

export const FIND_HOLIDAYS_BY_YEAR_QUERY = `
  SELECT holiday_date, name, holiday_type, description
  FROM holidays
  WHERE country = ? AND year = ?
  ORDER BY holiday_date ASC, name ASC
`;

export const FIND_HOLIDAYS_IN_RANGE_QUERY = `
  SELECT holiday_date, name, holiday_type, description
  FROM holidays
  WHERE country = ? AND holiday_date BETWEEN ? AND ?
  ORDER BY holiday_date ASC, name ASC
`;
