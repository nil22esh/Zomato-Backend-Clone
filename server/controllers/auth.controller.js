import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  createUser,
  findUserByEmail,
  findUserByEmailOrPhone,
  findUserByEmailWithOTP,
  findUserByRefreshToken,
  findUserByResetPasswordToken,
  findUserWithEmailVerificationToken,
} from "../services/auth.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { BadRequestError } from "../utils/errors.js";
import {
  loginValidations,
  registerValidations,
  resetPasswordValidations,
} from "../validators/auth.validations.js";
import logger from "./../utils/logger.js";
import { sendEmail } from "../services/email.service.js";
import {
  forgotPasswordEmail,
  resetPasswordSuccessEmail,
  sendOtpEmail,
  verifyEmailTemplate,
  emailVerifiedSuccessTemplate,
  resendEmailVerificationTemplate,
} from "../utils/email.templates.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    registerValidations({ name, email, password, phone });

    const userExists = await findUserByEmailOrPhone({ email, phone });
    if (userExists) {
      throw new BadRequestError("User already exists with this email or phone");
    }

    const user = await createUser({ name, email, password, phone });
    if (!user) {
      throw new BadRequestError("User not created, something went wrong");
    }

    const emailToken = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(emailToken)
      .digest("hex");

    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;

    // send email WITH TOKEN
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: verifyEmailTemplate({
        name: user.name,
        verifyUrl,
      }),
    });

    return successResponse(res, {
      statusCode: 201,
      message: "User registered successfully, please verify your email",
      data: user,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    loginValidations({ email, password });

    const checkUserExists = await findUserByEmail({ email });
    if (!checkUserExists) {
      throw new BadRequestError("User not found, please register first");
    }

    const isPasswordMatched = await checkUserExists.comparePassword(password);
    if (!isPasswordMatched) {
      throw new BadRequestError("Invalid email or password");
    }
    // generate tokens
    const accessToken = checkUserExists.generateJwtToken();
    const refreshToken = checkUserExists.generateRefreshToken();

    // Update user
    checkUserExists.lastLogin = new Date();
    checkUserExists.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });

    await checkUserExists.save();

    // Cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "user loggedIn successfully",
      data: checkUserExists,
      meta: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token missing");
    }

    // Find user WITH refreshTokens selected
    const user = await findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new BadRequestError("Invalid refresh token");
    }

    // Remove only this device's refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    );
    await user.save();

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(res, {
      statusCode: 200,
      message: "user logged out successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token missing");
    }

    // Verify refresh token signature & expiry
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new BadRequestError("Invalid or expired refresh token");
    }

    // Find user owning this refresh token
    const user = await findUserByRefreshToken(refreshToken);

    if (!user) {
      throw new BadRequestError("Invalid refresh token");
    }

    // Rotate refresh token
    const newRefreshToken = user.generateRefreshToken();

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    );

    // Add new refresh token
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
    });

    // Generate new access token
    const newAccessToken = user.generateJwtToken();

    await user.save();

    // Update refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Access token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    // check user
    const user = await findUserByEmail({ email });
    if (!user) {
      throw new BadRequestError("user not found");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token + expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Forgot password request",
      html: forgotPasswordEmail({ resetUrl }),
    });

    return successResponse(res, {
      message: "Reset link has been sent to registered email",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    resetPasswordValidations({ password, confirmPassword });

    // check token
    if (!req.params.token) {
      throw new BadRequestError("Reset token is missing");
    }

    // check reset token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // check user
    const user = await findUserByResetPasswordToken(hashedToken);
    if (!user) {
      throw new BadRequestError("Token expired or invalid");
    }

    // update password and data
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password reset successful",
      html: resetPasswordSuccessEmail(),
    });

    return successResponse(res, {
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    // check req.body
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    // check user
    const user = await findUserByEmail({ email });
    if (!user) {
      throw new BadRequestError("user not found");
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // hash otp
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    user.otp = hashedOTP;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "OTP Verification",
      html: sendOtpEmail({ otp }),
    });

    return successResponse(res, {
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    // check req.body
    if (!email || !otp) {
      throw new BadRequestError("Email or OTP both required");
    }

    // check user
    const user = await findUserByEmailWithOTP({ email });
    if (!user) {
      throw new BadRequestError("user not found");
    }

    // Check OTP expiry
    if (!user.otpExpire || user.otpExpire < Date.now()) {
      throw new BadRequestError("OTP expired, please request a new one");
    }

    // Hash incoming OTP
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Compare OTP
    if (user.otp !== hashedOTP) {
      throw new BadRequestError("Invalid OTP");
    }

    // Update user
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    return successResponse(res, {
      message: "Email verified successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new BadRequestError("Verification token is missing");
    }

    // Hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token and check expiry
    const user = await findUserWithEmailVerificationToken(hashedToken);

    if (!user) {
      throw new BadRequestError("Invalid or expired verification token");
    }

    if (user.isEmailVerified) {
      throw new BadRequestError("Email already verified");
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    // Send success email with correct template
    await sendEmail({
      to: user.email,
      subject: "Email Verified Successfully",
      html: emailVerifiedSuccessTemplate({ name: user.name }),
    });

    return successResponse(res, {
      message: "Email verified successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const resendEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    // Find user
    const user = await findUserByEmail({ email });
    if (!user) {
      throw new BadRequestError("User not found");
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new BadRequestError("Email is already verified");
    }

    // Generate new verification token
    const emailToken = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(emailToken)
      .digest("hex");

    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Email Verification - New Link",
      html: resendEmailVerificationTemplate({ verifyUrl }),
    });

    return successResponse(res, {
      message: "Verification email sent successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
