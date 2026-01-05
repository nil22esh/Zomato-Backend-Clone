import mongoose from "mongoose";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import {
  checkCategoryExists,
  createNewCategory,
  getdeletedCategory,
  getUpdatedCategory,
} from "../services/menu.service.js";
import { findRestaurantById } from "../services/restaurant.service.js";

export const createCategory = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }
    let { name, ...data } = req.body;
    const { restaurantId } = req.params;

    if (!name || typeof name !== "string") {
      throw new BadRequestError("Category name is required");
    }
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError("Invalid restaurant ID");
    }

    // Normalize name
    name = name.trim();

    const categoryExists = await checkCategoryExists(restaurantId, name);
    if (categoryExists) {
      throw new BadRequestError("Category already exists");
    }

    const category = await createNewCategory(name, data, restaurantId);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId, categoryId } = req.params;

    if (
      !restaurantId ||
      !categoryId ||
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      throw new BadRequestError("Invalid restaurant or category ID");
    }

    const updateData = req.body;
    if (!Object.keys(updateData).length) {
      throw new BadRequestError("Nothing to update");
    }

    const category = await getUpdatedCategory(
      restaurantId,
      categoryId,
      req.body
    );

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId, categoryId } = req.params;

    if (
      !restaurantId ||
      !categoryId ||
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      throw new BadRequestError("Invalid restaurant or category ID");
    }

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new BadRequestError("Restaurant not found");
    }

    const deletedCategory = await getdeletedCategory(restaurantId, categoryId);

    if (!deletedCategory) {
      throw new NotFoundError("Category not found");
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const toggleAvailability = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updatePrice = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
