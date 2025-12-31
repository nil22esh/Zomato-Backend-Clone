import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  createUser,
  findUserByEmail,
  findUserByEmailOrPhone,
  findUserByRefreshToken,
} from "../services/auth.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { BadRequestError } from "../utils/errors.js";
import {
  loginValidations,
  registerValidations,
} from "../validators/auth.validations.js";
import logger from "./../utils/logger.js";

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
    return successResponse(res, {
      statusCode: 201,
      message: "User registered successfully",
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
      throw new BadRequestError("user nor found");
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
    // console.log("----->>", resetUrl);

    // Send email
    return successResponse(res, {
      message: "Reset link has been sent to registered email",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
  } catch (error) {}
};
export const sendOTP = async (req, res) => {};
export const verifyOTP = async (req, res) => {};
export const verifyEmail = async (req, res) => {};
export const resendEmailVerification = async (req, res) => {};
