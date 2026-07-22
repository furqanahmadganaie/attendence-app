-- Move profile picture BLOB out of `employees` into a separate table.
-- This keeps `SELECT * FROM employees` clean and avoids printing binary data.

-- 1) Create the new table
CREATE TABLE IF NOT EXISTS employee_profile_pictures (
  employee_id BIGINT NOT NULL,
  profile_pic MEDIUMBLOB NULL,
  profile_pic_type VARCHAR(100) NULL,
  PRIMARY KEY (employee_id),
  CONSTRAINT fk_employee_profile_pictures_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id)
      ON DELETE CASCADE
);

-- 2) One-time migration (copy existing images from employees -> new table)
-- Run this BEFORE you drop columns from employees.
INSERT INTO employee_profile_pictures (employee_id, profile_pic, profile_pic_type)
SELECT id, profile_pic, profile_pic_type
FROM employees
WHERE profile_pic IS NOT NULL
ON DUPLICATE KEY UPDATE
  profile_pic = VALUES(profile_pic),
  profile_pic_type = VALUES(profile_pic_type);

-- 3) Optional cleanup (after you confirm everything works)
-- ALTER TABLE employees DROP COLUMN profile_pic, DROP COLUMN profile_pic_type;
