import validator from "validator";
import mongoose from "mongoose";
import { BadRequestError } from "../utils/errors.js";

export const validateCreateMenuItem = (req) => {
  const { name, description, price, foodType } = req.body;
  const { restaurantId, menuId } = req.params;
  const file = req.file;

  // Restaurant ID
  if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new BadRequestError("Invalid or missing restaurant ID");
  }

  // Category ID
  if (!menuId || !mongoose.Types.ObjectId.isValid(menuId)) {
    throw new BadRequestError("Invalid or missing category ID");
  }

  // Name
  if (!name || validator.isEmpty(name.trim())) {
    throw new BadRequestError("Item name is required");
  }

  if (!validator.isLength(name.trim(), { min: 2, max: 50 })) {
    throw new BadRequestError("Item name must be between 2 and 50 characters");
  }

  // Description (optional)
  if (
    description &&
    !validator.isLength(description.trim(), { min: 10, max: 200 })
  ) {
    throw new BadRequestError(
      "Description must be between 10 and 200 characters"
    );
  }

  // Price
  if (price === undefined || price === null) {
    throw new BadRequestError("Price is required");
  }

  if (!validator.isFloat(String(price), { gt: 0 })) {
    throw new BadRequestError("Price must be a number greater than 0");
  }

  // Food Type
  const allowedFoodTypes = ["veg", "non-veg", "egg", "vegan"];
  if (!foodType || !allowedFoodTypes.includes(foodType)) {
    throw new BadRequestError("Food type must be veg, non-veg, or vegan");
  }

  // Image (multer file)
  if (!file) {
    throw new BadRequestError("Image is required");
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestError("Invalid image format (jpg, png, webp allowed)");
  }

  // file size check (e.g., 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new BadRequestError("Image size must be less than 5MB");
  }

  return true;
};

export const validateUpdatePrice = (req) => {
  const { restaurantId, menuId, menuItemId } = req.params;
  const { price, discountedPrice } = req.body;

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new BadRequestError("Invalid restaurant ID");
  }

  if (!mongoose.Types.ObjectId.isValid(menuId)) {
    throw new BadRequestError("Invalid menu ID");
  }

  if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
    throw new BadRequestError("Invalid menu item ID");
  }

  // Price validation
  if (price === undefined || price === null) {
    throw new BadRequestError("Price is required");
  }

  if (typeof price !== "number" || price <= 0) {
    throw new BadRequestError("Price must be a number greater than 0");
  }

  // Discounted price validation (optional)
  if (discountedPrice !== undefined) {
    if (typeof discountedPrice !== "number" || discountedPrice < 0) {
      throw new BadRequestError(
        "Discounted price must be a number greater than or equal to 0"
      );
    }

    if (discountedPrice >= price) {
      throw new BadRequestError(
        "Discounted price must be less than actual price"
      );
    }
  }

  return true;
};
