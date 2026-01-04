import mongoose from "mongoose";
import {
  assignNextDefaultAddress,
  createAndAddAddress,
  deleteAddressById,
  findAddressById,
  getUserAddresses,
  unsetAllDefaultAddresses,
} from "../services/address.service.js";
import { getUserById } from "../services/user.service.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import { addAddressValidations } from "../validators/address.validations.js";
import User from "../models/user.model.js";

export const addAddress = async (req, res, next) => {
  try {
    // check user
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }
    const {
      addressLine1,
      addressLine2,
      city,
      landmark,
      state,
      pincode,
      country,
      location,
      geoSource,
      contactName,
      contactPhone,
      deliveryInstructions,
      priority,
      isDefault,
      isActive,
      label,
    } = req.body;
    const userId = req.user._id;

    // Proper validation
    addAddressValidations({ addressLine1, city, state, pincode, location });

    // find user
    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Create address with user reference
    const address = await createAndAddAddress({
      user: userId,
      addressLine1,
      addressLine2,
      city,
      landmark,
      state,
      pincode,
      country,
      location,
      geoSource,
      contactName,
      contactPhone,
      deliveryInstructions,
      priority,
      isDefault,
      label,
    });
    if (!address) {
      throw new BadRequestError("Failed to add new address");
    }

    // Attach address to user
    user.addresses.push(address._id);

    // Handle default address
    if (isDefault) {
      user.defaultAddress = address._id;
    }

    await user.save();

    return successResponse(res, {
      statusCode: 201,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getAllAddresses = async (req, res, next) => {
  try {
    // check user
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const userId = req.user._id;

    const addresses = await getUserAddresses(userId);

    if (!addresses || addresses.length === 0) {
      return successResponse(res, {
        statusCode: 200,
        message: "Addresses fetched successfully",
        meta: { totalCount: addresses.length },
        data: addresses,
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Addresses fetched successfully",
      meta: { totalCount: addresses.length },
      data: addresses,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getAddressById = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorised");
    }

    const { addressId } = req.params;
    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      throw new BadRequestError("Invalid address ID");
    }

    const address = await findAddressById(addressId);
    if (!address) {
      throw new NotFoundError("Address not found");
    }

    // check user ownership with address
    if (address.user.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied, you are not able to access it");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Address fetched successfully",
      data: address,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorised");
    }

    const { addressId } = req.params;
    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      throw new BadRequestError("Invalid address ID");
    }

    const address = await findAddressById(addressId);

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    // check user ownership with address
    if (address.user.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied, you are not able to access it");
    }

    // allow only specific fields
    const allowedUpdates = [
      "label",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "landmark",
      "location",
      "contactName",
      "contactPhone",
      "deliveryInstructions",
      "priority",
      "isDefault",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    // // triggers pre('save') middleware
    const updatedAddress = await address.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorised");
    }

    const userId = req.user._id;

    const { addressId } = req.params;
    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      throw new BadRequestError("Invalid address ID");
    }

    // delete only if user owns it
    const removedAddress = await deleteAddressById(addressId, userId);

    if (!removedAddress) {
      throw new NotFoundError("Address not found or access denied");
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { addresses: removedAddress._id },
    });

    // if default address deleted --->>> assign another as default
    if (removedAddress.isDefault) {
      await assignNextDefaultAddress(req.user._id);
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Address deleted successfully",
      data: removedAddress,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const userId = req.user._id;
    const { addressId } = req.params;

    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      throw new BadRequestError("Invalid address ID");
    }

    // check address ownership
    const address = await findAddressById(addressId);
    if (!address) {
      throw new NotFoundError("Address not found");
    }

    if (address.user.toString() !== userId.toString()) {
      throw new ForbiddenError("Access denied");
    }

    // unset previous default addresses
    await unsetAllDefaultAddresses(userId);

    // set new default
    address.isDefault = true;
    // triggers middleware if any
    await address.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const validateAddress = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const userId = req.user._id;
    const { addressId } = req.params;

    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      throw new BadRequestError("Invalid address ID");
    }

    const address = await findAddressById(addressId);

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    // ownership check
    if (address.user.toString() !== userId.toString()) {
      throw new ForbiddenError("Access denied");
    }

    // basic completeness validation
    const requiredFields = [
      "addressLine1",
      "city",
      "state",
      "pincode",
      "country",
    ];

    const missingFields = requiredFields.filter((field) => !address[field]);

    if (missingFields.length > 0) {
      throw new BadRequestError(
        `Address is incomplete. Missing fields: ${missingFields.join(", ")}`
      );
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Address is valid and usable",
      data: {
        addressId: address._id,
        isDefault: address.isDefault,
        validated: true,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getNearbyRestaurants = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getDeliveryEstimate = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
