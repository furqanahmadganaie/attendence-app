export const FIND_USER_BY_EMAIL_QUERY =
  "SELECT * FROM employees WHERE LOWER(email) = LOWER(?) LIMIT 1";

export const FIND_USER_BY_ID_QUERY =
  "SELECT * FROM employees WHERE id = ? LIMIT 1";

export const SHOW_EMPLOYEE_COLUMNS_QUERY = "SHOW COLUMNS FROM employees";

export const UPDATE_EMPLOYEE_ID_QUERY =
  "UPDATE employees SET employeeId = ? WHERE id = ?";

export const buildCreateEmployeeQuery = (passwordColumnName) => `
  INSERT INTO employees (employeeId, name, email, ${passwordColumnName})
  VALUES (?, ?, ?, ?)
`;

export const buildUpdatePasswordQuery = (passwordColumnName) =>
  `UPDATE employees SET ${passwordColumnName} = ? WHERE id = ?`;
