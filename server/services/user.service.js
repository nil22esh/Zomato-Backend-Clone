import User from "../models/user.model.js";

export const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

export const updateUserById = async (id, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  return updatedUser;
};
