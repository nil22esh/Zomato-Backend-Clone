import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import {
  authorizeRoles,
  isAdmin,
  isRestaurantOwner,
} from "../middlewares/checkRole.middleware.js";
import {
  createRestaurant,
  deleteRestaurant,
  getAllUserRestaurants,
  getAllUsersAllRestaurants,
  getAnalytics,
  getFeaturedRestaurants,
  getMenu,
  getNearbyRestaurants,
  getOrders,
  getRestaurantById,
  getRestaurantBySlug,
  getReviews,
  toggleStatus,
  updateRestaurant,
  uploadImages,
} from "../controllers/restaurant.controller.js";
import upload from "../middlewares/upload.middleware.js";

const restaurantRouter = express.Router();

//  Create new restaurant ---> Private (Admin/Restaurant Owner)
restaurantRouter.post(
  "/add-new-restaurant",
  authenticate,
  isRestaurantOwner,
  createRestaurant
);
// Get all my restaurants
restaurantRouter.get(
  "/my-restaurants",
  authenticate,
  isRestaurantOwner,
  getAllUserRestaurants
);
// Get all restaurants with of all users
restaurantRouter.get(
  "/all-users-restaurants",
  authenticate,
  isAdmin,
  getAllUsersAllRestaurants
);
// Get nearby restaurants based on location
restaurantRouter.get("/nearby/:addressId", authenticate, getNearbyRestaurants);
// Get featured restaurants
restaurantRouter.get("/featured", authenticate, getFeaturedRestaurants);
// restaurant by ID
restaurantRouter.get("/:restaurantId", authenticate, getRestaurantById);
// Get restaurant by slug
restaurantRouter.get("/slug/:slug", authenticate, getRestaurantBySlug);
// Update restaurant ---> Private (Restaurant Owner)
restaurantRouter.put(
  "/update-restaurant/:restaurantId",
  authenticate,
  isRestaurantOwner,
  updateRestaurant
);
// Delete restaurant ---> Private (Admin, restaurant owner)
restaurantRouter.delete(
  "/delete-restaurant/:restaurantId",
  authenticate,
  authorizeRoles("admin", "restaurant_owner"),
  deleteRestaurant
);
// Upload restaurant images ---> Private (Restaurant Owner)
restaurantRouter.post(
  "/upload-images/:restaurantId",
  authenticate,
  isRestaurantOwner,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  uploadImages
);
// Toggle restaurant open/close status ---> Private (Restaurant Owner)
restaurantRouter.put(
  "/toggle-status/:restaurantId",
  authenticate,
  isRestaurantOwner,
  toggleStatus
);
// Get restaurant menu
restaurantRouter.get("/restaurantId/menu", authenticate, getMenu);
// Get restaurant reviews
restaurantRouter.get("/restaurantId/reviews", authenticate, getReviews);
// Get restaurant orders ---> Private (Restaurant Owner)
restaurantRouter.get(
  "/restaurantId/orders",
  authenticate,
  isRestaurantOwner,
  getOrders
);
// Get restaurant analytics ---> Private (Restaurant Owner)
restaurantRouter.get(
  "/:id/analytics",
  authenticate,
  isRestaurantOwner,
  getAnalytics
);

export default restaurantRouter;
