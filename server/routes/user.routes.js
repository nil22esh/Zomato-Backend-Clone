import express from "express";
import {
  getUserAddresses,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
const userRouter = express.Router();

// Get user profile
userRouter.get("/get-user-profile", authenticate, getUserProfile);
// Update user profile
userRouter.put("/update-user-profile", authenticate, updateUserProfile);
// Get user addresses
userRouter.get("/get-user-addresses", authenticate, getUserAddresses);

export default userRouter;
