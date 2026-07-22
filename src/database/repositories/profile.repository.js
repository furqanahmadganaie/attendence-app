import db from "../db.js";
import {
  FIND_PROFILE_PICTURE_BY_USER_ID_QUERY,
  UPSERT_PROFILE_PICTURE_QUERY
} from "../queries/profile.queries.js";

export const updateProfilePicture = async (
  userId,
  pictureBuffer,
  pictureType,
  executor = db
) => {
  const [result] = await executor.execute(UPSERT_PROFILE_PICTURE_QUERY, [
    userId,
    pictureBuffer,
    pictureType
  ]);
  return result.affectedRows || 0; // MySQL upsert can return 1 or 2
};

export const findProfilePictureByUserId = async (userId, executor = db) => {
  const [rows] = await executor.execute(FIND_PROFILE_PICTURE_BY_USER_ID_QUERY, [
    userId
  ]);
  return rows[0] || null;
};
