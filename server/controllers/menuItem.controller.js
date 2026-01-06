import mongoose from "mongoose";
import { findRestaurantsMenuById } from "../services/menu.service.js";
import {
  createMenuItem,
  findAndUpdateMenuItemById,
  findMenuItemById,
  findMenuItemByName,
  removeItemById,
  updateMenuItemPrice,
} from "../services/menuItem.service.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import {
  validateCreateMenuItem,
  validateUpdatePrice,
} from "../validators/menuItem.validations.js";
import { findRestaurantById } from "../services/restaurant.service.js";

export const createItem = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    validateCreateMenuItem(req);

    const { restaurantId, menuId } = req.params;
    const {
      name,
      description,
      price,
      foodType,
      customizations,
      addons,
      ...rest
    } = req.body;

    const image = req.file?.path || null;

    // Parse JSON fields
    let parsedCustomizations = customizations;
    let parsedAddons = addons;

    if (customizations) {
      parsedCustomizations = JSON.parse(customizations);
    }

    if (addons) {
      parsedAddons = JSON.parse(addons);
    }

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    // check req.user is the owner of the restaurant ot not
    if (req.user._id.toString() !== restaurant.owner.toString()) {
      throw new UnauthorizedError("Access denied");
    }

    // Check menu belongs to restaurant
    const menu = await findRestaurantsMenuById(restaurantId, menuId);
    if (!menu) {
      throw new NotFoundError("Restaurant menu not found");
    }

    // Check duplicate item in same menu
    const existingItem = await findMenuItemByName(menuId, name);
    if (existingItem) {
      throw new ConflictError("Menu item already exists");
    }

    // Create menu item
    const item = await createMenuItem({
      name: name.trim(),
      description,
      price,
      foodType,
      image,
      menu: menuId,
      restaurant: restaurantId,
      customizations: parsedCustomizations,
      addons: parsedAddons,
      ...rest,
    });
    if (!item) {
      throw new BadRequestError("Menu item not created");
    }

    // Push item into menu
    menu.items.push(item._id);
    await menu.save();

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: item,
      meta: {
        menu: menu.items,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId, menuId, menuItemId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(menuItemId)
    ) {
      throw new BadRequestError("Invalid IDs provided");
    }

    const menu = await findRestaurantsMenuById(restaurantId, menuId);
    if (!menu) {
      throw new NotFoundError("Menu not found");
    }

    const item = await findMenuItemById(menuId, menuItemId, restaurantId);
    if (!item) {
      throw new NotFoundError("Menu item not found");
    }

    return res.status(200).json({
      success: true,
      message: "Menu item fetched successfully",
      data: item,
      meta: {
        menuId: menu._id,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId, menuId, menuItemId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(menuItemId)
    ) {
      throw new BadRequestError("Invalid IDs provided");
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "discountedPrice",
      "category",
      "isAvailable",
      "isRecommended",
      "isBestseller",
      "spiceLevel",
      "preparationTime",
      "servingInfo",
      "nutrition",
      "allergens",
      "tags",
      "customizations",
      "addons",
      "displayOrder",
    ];

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (!Object.keys(updateData).length) {
      throw new BadRequestError("Nothing to update");
    }

    const menu = await findRestaurantsMenuById(restaurantId, menuId);
    if (!menu) {
      throw new NotFoundError("Menu not found");
    }

    const item = await findMenuItemById(menuId, menuItemId, restaurantId);
    if (!item) {
      throw new NotFoundError("Menu item not found");
    }

    Object.assign(item, updateData);
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: item,
      meta: {
        menuId: menu._id,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId, menuId, menuItemId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(menuItemId)
    ) {
      throw new BadRequestError("Invalid IDs provided");
    }

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    // check req.user is the owner of the restaurant ot not
    if (req.user._id.toString() !== restaurant.owner.toString()) {
      throw new UnauthorizedError("Access denied");
    }

    const menu = await findRestaurantsMenuById(restaurantId, menuId);
    if (!menu) {
      throw new NotFoundError("Menu not found");
    }

    const item = await removeItemById(
      menuId,
      menuItemId,
      restaurantId,
      session
    );
    if (!item) {
      throw new NotFoundError("Menu item not found");
    }

    menu.items.pull(item._id);
    await menu.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
      data: item,
      meta: {
        menuId: menu._id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(error);
    next(error);
  }
};

export const toggleAvailability = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId, menuId, menuItemId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(menuItemId)
    ) {
      throw new BadRequestError("Invalid IDs provided");
    }

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    // check req.user is the owner of the restaurant ot not
    if (req.user._id.toString() !== restaurant.owner.toString()) {
      throw new UnauthorizedError("Access denied");
    }

    const menu = await findRestaurantsMenuById(restaurantId, menuId);
    if (!menu) {
      throw new NotFoundError("Menu not found");
    }

    const item = await findMenuItemById(menuId, menuItemId, restaurantId);
    if (!item) {
      throw new NotFoundError("Menu item not found");
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `${item.name} now ${
        item.isAvailable ? "available" : "not-available"
      }`,
      data: item,
      meta: {
        menuId: menu._id,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updatePrice = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    validateUpdatePrice(req);

    const { restaurantId, menuId, menuItemId } = req.params;
    const { price, discountedPrice } = req.body;

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    // check req.user is the owner of the restaurant ot not
    if (req.user._id.toString() !== restaurant.owner.toString()) {
      throw new UnauthorizedError("Access denied");
    }

    // Ensure menu belongs to restaurant
    const menu = await findRestaurantsMenuById(restaurantId, menuId);
    if (!menu) {
      throw new NotFoundError("Menu not found");
    }

    const updatedItem = await updateMenuItemPrice(
      restaurantId,
      menuId,
      menuItemId,
      { price, discountedPrice }
    );

    if (!updatedItem) {
      throw new NotFoundError("Menu item not found");
    }

    return res.status(200).json({
      success: true,
      message: "Menu item price updated successfully",
      data: updatedItem,
      meta: {
        effectivePrice: updatedItem.discountedPrice || updatedItem.price,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
