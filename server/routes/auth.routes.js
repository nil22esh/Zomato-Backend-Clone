import express from "express";
import {
  forgotPassword,
  getRefreshToken,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailVerification,
  resetPassword,
  sendOTP,
  verifyEmail,
  verifyOTP,
  verifyPhone,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

// register user
authRouter.post("/register-user", registerUser);
// login user
authRouter.post("/login-user", loginUser);
// logout user
authRouter.post("/logout-user", logoutUser);
// generate new refresh token
authRouter.post("/refresh-token", getRefreshToken);
// forgot password
authRouter.post("/forgot-password", forgotPassword);
// reset-password
authRouter.post("/reset-password/:token", resetPassword);
// send OTP
authRouter.post("/send-OTP", sendOTP);
// verify OTP
authRouter.post("/verify-OTP", verifyOTP);
// Verify email
authRouter.get("/verify-email/:token", verifyEmail);
// Verify phone
authRouter.post("/verify-phone", verifyPhone);
// Resend verification email
authRouter.post("/resend-email-verification", resendEmailVerification);

export default authRouter;
