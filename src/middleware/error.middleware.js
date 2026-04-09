import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (error, req, res, next) => {
  const statusCode =
    error instanceof AppError
      ? error.statusCode
      : error?.type === "entity.parse.failed"
        ? 400
        : 500;

  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
      error
    );
  }

  const response = {
    message: isServerError ? "Internal server error" : error.message
  };

  if (!isServerError && Array.isArray(error.details) && error.details.length > 0) {
    response.errors = error.details;
  }

  if (env.nodeEnv !== "production" && isServerError) {
    response.error = error.message;
  }

  res.status(statusCode).json(response);
};
