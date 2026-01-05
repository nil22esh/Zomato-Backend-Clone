import validator from "validator";
import { BadRequestError } from "../utils/errors.js";

export const createRestaurantValidations = (data = {}) => {
  const {
    name,
    owner,
    cuisines,
    priceForTwo,
    location,
    contact,
    deliveryTime,
    license,
  } = data;

  if (!name || !validator.isLength(name.trim(), { min: 2, max: 100 })) {
    throw new BadRequestError(
      "Restaurant name must be between 2 and 100 characters"
    );
  }

  if (!owner || !validator.isMongoId(owner.toString())) {
    throw new BadRequestError("Valid owner ID is required");
  }

  if (!Array.isArray(cuisines) || cuisines.length === 0) {
    throw new BadRequestError("At least one cuisine is required");
  }

  if (
    priceForTwo === undefined ||
    !Number.isFinite(priceForTwo) ||
    priceForTwo < 0
  ) {
    throw new BadRequestError("Price for two must be a valid positive number");
  }

  if (!location?.address) {
    throw new BadRequestError("Restaurant address is required");
  }

  const { street, city, state, pincode } = location.address;

  if (!street || !city || !state) {
    throw new BadRequestError(
      "Street, city, and state are required in address"
    );
  }

  if (!pincode || !validator.matches(pincode, /^[0-9]{6}$/)) {
    throw new BadRequestError("Pincode must be a valid 6-digit number");
  }

  if (
    !location?.coordinates?.coordinates ||
    !Array.isArray(location.coordinates.coordinates) ||
    location.coordinates.coordinates.length !== 2
  ) {
    throw new BadRequestError(
      "Valid longitude & latitude coordinates are required"
    );
  }

  if (!contact?.phone || !validator.matches(contact.phone, /^[0-9]{10}$/)) {
    throw new BadRequestError("Valid 10-digit contact phone is required");
  }

  if (contact.email && !validator.isEmail(contact.email)) {
    throw new BadRequestError("Invalid contact email");
  }

  if (
    !deliveryTime?.min ||
    !deliveryTime?.max ||
    deliveryTime.min > deliveryTime.max
  ) {
    throw new BadRequestError("Invalid delivery time range");
  }

  if (!license?.fssai || !validator.isLength(license.fssai, { min: 5 })) {
    throw new BadRequestError("Valid FSSAI license number is required");
  }

  return true;
};
