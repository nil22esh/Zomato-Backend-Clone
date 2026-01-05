import mongoose from "mongoose";
import {
  addRestaurant,
  findFeaturedRestaurants,
  findRestaurantById,
  findRestaurantBySlug,
  getRestaurants,
  isRestaurantExists,
  updateRestaurantById,
  userRestaurants,
} from "../services/restaurant.service.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import { createRestaurantValidations } from "../validators/restaurant.validations.js";
import {
  findAddressById,
  findNearestRestaurants,
} from "../services/address.service.js";
import uploadToCloudinary from "../services/cloudinary.service.js";

export const createRestaurant = async (req, res, next) => {
  try {
    // ensure user is logged in
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    // owner from authenticated user
    const owner = req.user._id;
    // merge owner into payload for validation
    const payload = {
      ...req.body,
      owner,
    };
    // Validate incoming restaurant data
    createRestaurantValidations(payload);

    // Prevent duplicate restaurant creation for same owner
    const exists = await isRestaurantExists(payload.name, owner);
    if (exists) {
      throw new ConflictError("Restaurant already exists");
    }

    // Persist restaurant to database
    const restaurant = await addRestaurant(payload);
    if (!restaurant) {
      throw new InternalServerError(
        "Restaurant not created, please try again later"
      );
    }

    // Maintain bidirectional relationship
    req.user.restaurants.push(restaurant._id);
    await req.user.save();

    // success response
    return successResponse(res, {
      statusCode: 201,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getAllUserRestaurants = async (req, res, next) => {
  try {
    // ensure user is logged in
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    // Extract owner from authenticated user
    const owner = req.user._id;

    // fetch restaurants owned by user
    const restaurants = await userRestaurants(owner);
    if (!restaurants) {
      throw new BadRequestError("No restaurants found");
    }

    // Proper empty check
    if (restaurants.length === 0) {
      throw new NotFoundError("No restaurants found");
    }

    // Success response
    return successResponse(res, {
      statusCode: 200,
      message: "Your restaurants fetched successfully",
      data: restaurants,
      meta: {
        total: restaurants.length,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getAllUsersAllRestaurants = async (req, res, next) => {
  try {
    // fetch restaurants of all users
    const restaurants = await getRestaurants();

    // Handle empty result
    if (!restaurants || restaurants.length === 0) {
      throw new NotFoundError("No restaurants found");
    }

    // Success response
    return successResponse(res, {
      statusCode: 200,
      message: "All restaurants fetched successfully",
      data: restaurants,
      meta: {
        total: restaurants.length,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getNearbyRestaurants = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const userId = req.user._id;
    const { addressId } = req.params;
    // validate addressId
    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      throw new BadRequestError("Invalid address ID");
    }

    // Fetch address
    const address = await findAddressById(addressId);
    if (!address) {
      throw new NotFoundError("Address not found");
    }

    // Fetch nearby restaurants using coordinates
    const restaurants = await findNearestRestaurants(
      address.location.coordinates
    );
    if (!restaurants || restaurants.length === 0) {
      throw new NotFoundError("No nearby restaurants found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Nearby restaurants fetched successfully",
      data: restaurants,
      meta: {
        total: restaurants.length,
        radius: "5km",
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getFeaturedRestaurants = async (req, res, next) => {
  try {
    const restaurants = await findFeaturedRestaurants();
    // No featured restaurants found
    if (!restaurants || restaurants.length === 0) {
      throw new NotFoundError("No featured restaurants found");
    }

    // Success response
    return successResponse(res, {
      statusCode: 200,
      message: "Featured restaurants fetched successfully",
      data: restaurants,
      meta: {
        total: restaurants.length,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    // Validate restaurantId
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError("Invalid restaurant ID");
    }

    // Fetch restaurant
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Restaurant fetched successfully",
      data: restaurant,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getRestaurantBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    // Validate slug
    if (!slug || typeof slug !== "string") {
      throw new BadRequestError("Invalid slug");
    }

    const normalizedSlug = slug.trim().toLowerCase();

    // slug format check (seo friendly)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(normalizedSlug)) {
      throw new BadRequestError("Invalid slug format");
    }

    // Fetch restaurant by slug
    const restaurant = await findRestaurantBySlug(normalizedSlug);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Restaurant fetched successfully",
      data: restaurant,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId } = req.params;
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError("Invalid restaurant ID");
    }

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    // ownership check
    if (!restaurant.owner) {
      throw new ForbiddenError("Restaurant ownership missing");
    }

    if (restaurant.owner._id.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied");
    }

    // Whitelist allowed fields
    const allowedUpdates = [
      "name",
      "description",
      "cuisines",
      "images",
      "location",
      "contact",
      "timings",
      "priceForTwo",
      "minimumOrder",
      "deliveryFee",
      "packagingCharges",
      "deliveryTime",
      "deliveryRadius",
      "isOpen",
      "isAcceptingOrders",
      "isPureVeg",
      "tags",
      "features",
    ];

    const updateData = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update restaurant
    const updatedRestaurant = await updateRestaurantById(
      restaurantId,
      updateData
    );

    if (!updatedRestaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId } = req.params;
    // Validate restaurantId
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError("Invalid restaurant ID");
    }

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    if (!restaurant.owner) {
      throw new ForbiddenError("Restaurant ownership missing");
    }

    // Authorization
    if (
      req.user.role !== "admin" &&
      restaurant.owner._id.toString() !== req.user._id.toString()
    ) {
      throw new ForbiddenError("Access denied");
    }

    // Soft delete
    restaurant.isActive = false;
    await restaurant.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const uploadImages = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId } = req.params;

    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError("Invalid restaurant ID");
    }

    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    // IMPORTANT: req.files is an OBJECT, not iterable
    const coverFile = req.files?.cover?.[0];
    const logoFile = req.files?.logo?.[0];
    const galleryFiles = req.files?.gallery || [];

    if (!coverFile && !logoFile && galleryFiles.length === 0) {
      throw new BadRequestError("No images uploaded");
    }

    // Prepare update object
    const images = { ...restaurant.images };

    if (coverFile) {
      images.cover = coverFile.path; // Cloudinary URL
    }

    if (logoFile) {
      images.logo = logoFile.path;
    }

    if (galleryFiles.length > 0) {
      images.gallery = galleryFiles.map((file) => file.path);
    }

    restaurant.images = images;
    await restaurant.save();

    return successResponse(res, {
      statusCode: 201,
      message: "Images uploaded successfully",
      data: restaurant,
      meta: {
        images: restaurant.images,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const toggleStatus = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { restaurantId } = req.params;
    // Validate restaurantId
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError("Invalid restaurant ID");
    }

    // Fetch restaurant
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    // Ownership check
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied");
    }

    // Toggle status
    restaurant.isOpen = !restaurant.isOpen;
    restaurant.isAcceptingOrders = restaurant.isOpen;
    await restaurant.save();

    return successResponse(res, {
      statusCode: 200,
      message: `Restaurant is now ${restaurant.isOpen ? "OPEN" : "CLOSED"}`,
      data: {
        isOpen: restaurant.isOpen,
        isAcceptingOrders: restaurant.isAcceptingOrders,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getMenu = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
