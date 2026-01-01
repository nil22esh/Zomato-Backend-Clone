import { getUserById, updateUserById } from "../services/user.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export const getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    const user = await getUserById(req.user.id);
    if (!user) {
      throw new BadRequestError("user not found");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "user profile fetched successfully",
      data: user,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    const updateData = req.body;

    const updatedUser = await updateUserById(req.user.id, updateData);
    if (!updatedUser) {
      throw new BadRequestError("user not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "user profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getUserAddresses = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new BadRequestError("Unauthorised");
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User addresses fetched successfully",
      data: user.addresses,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
