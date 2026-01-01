import User from "../models/user.model.js";

export const findUserByEmailOrPhone = async ({ email, phone }) => {
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  return user;
};

export const createUser = async ({ name, email, password, phone }) => {
  const newUser = await User.create({ name, email, password, phone });
  return newUser;
};

export const findUserByEmail = async ({ email }) => {
  const user = await User.findOne({ email });
  return user;
};

export const findUserByPhone = async ({ phone }) => {
  const user = await User.findOne({ phone });
  return user;
};

export const findUserByRefreshToken = async (refreshToken) => {
  const user = await User.findOne({ "refreshTokens.token": refreshToken });
  return user;
};

export const findUserByResetPasswordToken = async (hashedToken) => {
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  return user;
};

export const findUserByEmailWithOTP = async ({ email }) => {
  return await User.findOne({ email }).select("+otp +otpExpire");
};

export const findUserWithEmailVerificationToken = async (hashedToken) => {
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpire");
  return user;
};
