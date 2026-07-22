export const FIND_ALL_LEAVE_REQUESTS_QUERY = `
  SELECT
    l.id,
    l.employee_id,
    e.employeeId AS employee_code,
    e.name AS employee_name,
    e.email AS employee_email,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.status,
    l.approved_by
  FROM employee_leaves l
  JOIN employees e ON e.id = l.employee_id
  ORDER BY l.id DESC
`;

export const FIND_LEAVE_REQUESTS_BY_STATUS_QUERY = `
  SELECT
    l.id,
    l.employee_id,
    e.employeeId AS employee_code,
    e.name AS employee_name,
    e.email AS employee_email,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.status,
    l.approved_by
  FROM employee_leaves l
  JOIN employees e ON e.id = l.employee_id
  WHERE l.status = ?
  ORDER BY l.id DESC
`;

export const FIND_LEAVE_REQUEST_BY_ID_QUERY = `
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

export const UPDATE_LEAVE_REQUEST_STATUS_QUERY = `
  UPDATE employee_leaves
  SET status = ?, approved_by = ?
  WHERE id = ?
`;
