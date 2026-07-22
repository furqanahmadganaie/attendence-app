const EMPLOYEE_ID_PREFIX = "CEN";
const EMPLOYEE_ID_PAD_LENGTH = 4;

export const createEmployeeId = (insertId) =>
  `${EMPLOYEE_ID_PREFIX}${String(insertId).padStart(EMPLOYEE_ID_PAD_LENGTH, "0")}`;

export const createPublicUser = (user) => ({
  id: user.id,
  employeeId: user.employeeId,
  name: user.name,
  email: user.email,
  isAdmin: Boolean(user.is_admin)
});

export const getStoredPassword = (user) => user.password ?? user.password_hash ?? "";
