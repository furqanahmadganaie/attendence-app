export const FIND_PROFILE_PICTURE_BY_USER_ID_QUERY = `
  SELECT profile_pic, profile_pic_type
  FROM employee_profile_pictures
  WHERE employee_id = ?
  LIMIT 1
`;

export const UPSERT_PROFILE_PICTURE_QUERY = `
  INSERT INTO employee_profile_pictures (employee_id, profile_pic, profile_pic_type)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
    profile_pic = VALUES(profile_pic),
    profile_pic_type = VALUES(profile_pic_type)
`;
