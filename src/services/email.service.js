import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!env.smtpConfigured) {
    throw new AppError(
      "Email delivery is not configured. Please set SMTP environment variables.",
      500
    );
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return transporter;
};

export const sendRegistrationOtpEmail = async ({ email, otp }) => {
  const subject = `${env.appName} email verification OTP`;
  const text = [
    `Your ${env.appName} verification code is ${otp}.`,
    `It expires in ${env.otpExpiresInMinutes} minutes.`
  ].join(" ");

  if (!env.smtpConfigured) {
    if (env.nodeEnv !== "production") {
      console.info(
        `[DEV OTP] Registration OTP for ${email}: ${otp} (expires in ${env.otpExpiresInMinutes} minutes)`
      );

      return {
        delivered: false,
        mode: "console"
      };
    }

    throw new AppError(
      "Email delivery is not configured. Please set SMTP environment variables.",
      500
    );
  }

  await getTransporter().sendMail({
    from: env.smtpFrom,
    to: email,
    subject,
    text,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Verify Your Email</h2>
        <p>Your ${env.appName} verification code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
        <p>This code will expire in ${env.otpExpiresInMinutes} minutes.</p>
      </div>
    `
  });

  return {
    delivered: true,
    mode: "smtp"
  };
};
