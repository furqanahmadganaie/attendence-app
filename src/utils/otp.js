import crypto from "crypto";

export const generateOtpCode = () =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

export const hashOtpCode = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const getOtpExpirationDate = (minutes) => {
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + minutes);

  return expirationDate;
};

export const isDateExpired = (dateValue) => new Date(dateValue).getTime() <= Date.now();
