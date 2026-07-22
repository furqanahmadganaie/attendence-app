export const CREATE_LEAVE_QUERY = `
  INSERT INTO employee_leaves (
    employee_id,
    leave_type,
    start_date,
    end_date,
    status,
    approved_by
  ) VALUES (?, ?, ?, ?, 'pending', NULL)
`;

export const FIND_LEAVE_BY_ID_QUERY = `
  SELECT
    id,
    employee_id,
    leave_type,
    start_date,
    end_date,
    status,
    approved_by
  FROM employee_leaves
  WHERE id = ?
  LIMIT 1
`;

export const FIND_LEAVES_BY_EMPLOYEE_ID_QUERY = `
  SELECT
    id,
    employee_id,
    leave_type,
    start_date,
    end_date,
    status,
    approved_by
  FROM employee_leaves
  WHERE employee_id = ?
  ORDER BY id DESC
`;

export const FIND_APPROVED_LEAVES_BY_EMPLOYEE_ID_IN_RANGE_QUERY = `
  SELECT
    id,
    employee_id,
    leave_type,
    start_date,
    end_date,
    status,
    approved_by
  FROM employee_leaves
  WHERE employee_id = ?
    AND status = 'approved'
    AND start_date <= ?
    AND end_date >= ?
  ORDER BY start_date ASC, id ASC
`;
