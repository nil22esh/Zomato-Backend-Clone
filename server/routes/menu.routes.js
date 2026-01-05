import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/checkRole.middleware.js";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  getItemById,
  toggleAvailability,
  updateCategory,
  updateItem,
  updatePrice,
} from "../controllers/menu.controller.js";

const menuRouter = express.Router();

// POST /api/v1/menu/categories --> Create menu category --> Private (Restaurant Owner)
menuRouter.post(
  "/:restaurantId/categories",
  authenticate,
  authorizeRoles("restaurant_owner"),
  createCategory
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
// POST /api/v1/menu/items --> Create menu item --> Private (Restaurant Owner)
menuRouter.post(
  "/items",
  authenticate,
  authorizeRoles("restaurant_owner"),
  // upload.single("image"),
  createItem
);
// GET /api/v1/menu/items/:id --> Get menu item by ID --> Public
menuRouter.get("/items/:id", getItemById);
// PUT /api/v1/menu/items/:id --> Update menu item --> Private (Restaurant Owner)
menuRouter.put(
  "/items/:id",
  authenticate,
  authorizeRoles("restaurant_owner"),
  // upload.single("image"),
  updateItem
);
// DELETE /api/v1/menu/items/:id --> Delete menu item --> Private (Restaurant Owner)
menuRouter.delete(
  "/items/:id",
  authenticate,
  authorizeRoles("restaurant_owner"),
  deleteItem
);
// PUT /api/v1/menu/items/:id/availability --> Toggle item availability --> Private (Restaurant Owner)
menuRouter.put(
  "/items/:id/availability",
  authenticate,
  authorizeRoles("restaurant_owner"),
  toggleAvailability
);
// PUT /api/v1/menu/items/:id/price --> Update item price --> Private (Restaurant Owner)
menuRouter.put(
  "/items/:id/price",
  authenticate,
  authorizeRoles("restaurant_owner"),
  updatePrice
);

export default menuRouter;
