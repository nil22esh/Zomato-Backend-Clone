import express from "express";
import {
  addNewAddress,
  deleteAddress,
  getUserAddresses,
  getUserProfile,
  updateAddress,
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
// Add new address
userRouter.post("/add-new-address", authenticate, addNewAddress);
// Update address
userRouter.put("/update-address/:id", authenticate, updateAddress);
// Delete address
userRouter.delete("/delete-address/:id", authenticate, deleteAddress);

export default userRouter;
