import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/checkRole.middleware.js";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "../controllers/menu.controller.js";

const menuRouter = express.Router();

// POST /api/v1/menu/categories --> Create menu category --> Private (Restaurant Owner)
menuRouter.post(
  "/:restaurantId/categories",
  authenticate,
  authorizeRoles("restaurant_owner"),
  createCategory
);
// get /api/v1/menu/categories --> Create menu category --> Private (Restaurant Owner)
menuRouter.get(
  "/:restaurantId/categories/:categoryId",
  authenticate,
  authorizeRoles("restaurant_owner"),
  getCategoryById
);
// PUT /api/v1/menu/categories/:categoryId --> Update menu category --> Private (Restaurant Owner)
menuRouter.put(
  "/:restaurantId/update-categories/:categoryId",
  authenticate,
  authorizeRoles("restaurant_owner"),
  updateCategory
);
// DELETE /api/v1/menu/categories/categoryId --> Delete menu category --> Private (Restaurant Owner)
menuRouter.delete(
  "/:restaurantId/delete-categories/:categoryId",
  authenticate,
  authorizeRoles("restaurant_owner"),
  deleteCategory
);

export default menuRouter;
