import { AppError } from "../utils/app-error.js";

const isMissingValue = (value) =>
  value === undefined || value === null || value === "";

export const validateRequest = (schema) => (req, res, next) => {
  const errors = [];
  const sanitizedBody = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body?.[field];

    if (rules.required && isMissingValue(value)) {
      errors.push({
        field,
        message: rules.requiredMessage || `${field} is required`
      });
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (rules.type === "string" && typeof value !== "string") {
      errors.push({
        field,
        message: rules.typeMessage || `${field} must be a string`
      });
      continue;
    }

    let sanitizedValue = value;

    if (rules.trim && typeof sanitizedValue === "string") {
      sanitizedValue = sanitizedValue.trim();
    }

    if (
      rules.type === "string" &&
      rules.disallowEmpty &&
      sanitizedValue.length === 0
    ) {
      errors.push({
        field,
        message: rules.emptyMessage || `${field} cannot be empty`
      });
      continue;
    }

    if (
      rules.type === "string" &&
      rules.minLength &&
      sanitizedValue.length < rules.minLength
    ) {
      errors.push({
        field,
        message:
          rules.minLengthMessage ||
          `${field} must be at least ${rules.minLength} characters long`
      });
      continue;
    }

    if (
      rules.type === "string" &&
      rules.maxLength &&
      sanitizedValue.length > rules.maxLength
    ) {
      errors.push({
        field,
        message:
          rules.maxLengthMessage ||
          `${field} must not exceed ${rules.maxLength} characters`
      });
      continue;
    }

    if (
      rules.pattern &&
      typeof sanitizedValue === "string" &&
      !rules.pattern.test(sanitizedValue)
    ) {
      errors.push({
        field,
        message: rules.patternMessage || `${field} is invalid`
      });
      continue;
    }

    if (rules.toLowerCase && typeof sanitizedValue === "string") {
      sanitizedValue = sanitizedValue.toLowerCase();
    }

    sanitizedBody[field] = sanitizedValue;
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed", 400, errors));
  }

  req.validatedBody = {
    ...req.body,
    ...sanitizedBody
  };

  return next();
};
