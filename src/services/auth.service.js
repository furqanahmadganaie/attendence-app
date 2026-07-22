import {
  createEmployee,
  findUserByEmail,
  findUserById,
  updateUserPassword
} from "../database/repositories/auth.repository.js";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { generateAccessToken } from "../utils/jwt.js";
import { createPublicUser, getStoredPassword } from "../utils/auth-user.js";

const createStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$.{53}$/;
const isBcryptHash = (value) =>
  typeof value === "string" && bcryptHashPattern.test(value);

export const registerUser = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const createdUser = await createEmployee({ name, email, passwordHash });

  return {
    user: createPublicUser(createdUser),
    accessToken: generateAccessToken(createdUser)
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const storedPassword = getStoredPassword(user);

  if (!storedPassword) {
    return null;
  }

  const isValidPassword = isBcryptHash(storedPassword)
    ? await bcrypt.compare(password, storedPassword)
    : storedPassword === password;

  if (!isValidPassword) {
    return null;
  }

  // If the DB still has a plain password, upgrade it to bcrypt after a successful login.
  if (!isBcryptHash(storedPassword)) {
    const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
    await updateUserPassword(user.id, passwordHash);
  }

  return {
    user: createPublicUser(user),
    accessToken: generateAccessToken(user)
  };
};

export const getAuthenticatedUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw createStatusError("Authenticated user not found", 401);
  }

  return createPublicUser(user);
};

export const logoutUser = async (authUser) => ({
  message: "Logout successful",
  userId: authUser.sub
});
