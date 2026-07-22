import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const isMailerConfigured = () =>
  Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.smtpFrom);

let cachedTransporter;

const getTransporter = () => {
  if (!isMailerConfigured()) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return cachedTransporter;
};

export const sendPasswordResetOtpEmail = async ({ to, otp }) => {
  const transporter = getTransporter();

  if (!transporter) {
    const error = new Error("Email service not configured");
    error.statusCode = 500;
    throw error;
  }

  const subject = `${env.appName}: Password reset OTP`;
  const text = [
    `Your ${env.appName} password reset OTP is: ${otp}`,
    "",
    `This OTP expires in ${env.otpExpiresMinutes} minutes.`,
    "If you did not request this, you can ignore this email."
  ].join("\n");

  await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text
  });
};

