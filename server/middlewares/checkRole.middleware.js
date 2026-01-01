import { UnauthorizedError } from "../utils/errors.js";

export const isAdmin = (req, res, next) => {
  if (!req.user.role !== "admin") {
    throw new UnauthorizedError("Unauthorized, you are not authorized");
  }
  next();
};

export const isRestaurantOwner = (req, res, next) => {
  if (!req.user.role !== "restaurant_owner") {
    throw new UnauthorizedError("Unauthorized, you are not authorized");
  }
  next();
};

export const isDeliveryPartner = (req, res, next) => {
  if (!req.user.role !== "delivery_partner") {
    throw new UnauthorizedError("Unauthorized, you are not authorized");
  }
  next();
};
