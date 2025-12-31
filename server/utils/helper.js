import crypto from "crypto";

// generate random numeric OTP
export const generateOTP = (length = 6) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * Math.pow(9, length - 1)
  ).toString();
};

// generate random token
export const generateToken = (size = 32) => {
  return crypto.randomBytes(size).toString("hex");
};
