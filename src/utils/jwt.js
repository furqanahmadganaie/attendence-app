import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      employeeId: user.employeeId,
      isAdmin: Boolean(user.is_admin)
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
};
