import validator from "validator";
import { BadRequestError } from "../utils/errors.js";

export const registerValidations = ({ name, email, password, phone }) => {
  if (!name || typeof name !== "string") {
    throw new BadRequestError("Name is required");
  }
  if (name.trim().length < 2 || name.trim().length > 50) {
    throw new BadRequestError("Name must be between 2 and 50 characters");
  }
  // Email validation
  if (!email) {
    throw new BadRequestError("Email is required");
  }
  if (!validator.isEmail(email)) {
    throw new BadRequestError("Invalid email address");
  }
  // Password validation
  if (!password) {
    throw new BadRequestError("Password is required");
  }
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new BadRequestError(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol"
    );
  }
  // Phone validation
  if (!phone) {
    throw new BadRequestError("Phone number is required");
  }
  if (!validator.isMobilePhone(phone, "en-IN")) {
    throw new BadRequestError("Invalid phone number");
  }
  return true;
};

export const loginValidations = ({ email, password }) => {
  if (!email) {
    throw new BadRequestError("Email is required");
  }
  if (!validator.isEmail(email)) {
    throw new BadRequestError("Invalid email address");
  }
  if (!password) {
    throw new BadRequestError("Password is required");
  }
  return true;
};

export const resetPasswordValidations = ({ password, confirmPassword }) => {
  if (!password) {
    throw new BadRequestError("Password is required");
  }
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new BadRequestError(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol"
    );
  }
  if (!confirmPassword) {
    throw new BadRequestError("Confirm password is required");
  }
  if (password !== confirmPassword) {
    throw new BadRequestError("Password and Confirm Password not matching");
  }
  return true;
};
