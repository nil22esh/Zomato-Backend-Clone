import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/checkRole.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  createItem,
  deleteItem,
  getItemById,
  toggleAvailability,
  updateItem,
  updatePrice,
} from "../controllers/menuItem.controller.js";

const menuItemRouter = express.Router();

// POST /api/v1/menu/items --> Create menu item --> Private (Restaurant Owner)
menuItemRouter.post(
  "/:restaurantId/:menuId/items",
  authenticate,
  authorizeRoles("restaurant_owner"),
  upload.single("image"),
  createItem
);
// GET /api/v1/menu/items/:menuItemId --> Get menu item by ID --> Public
menuItemRouter.get(
  "/:restaurantId/:menuId/items/:menuItemId",
  authenticate,
  getItemById
);
// PUT /api/v1/menu/items/:menuItemId --> Update menu item --> Private (Restaurant Owner)
menuItemRouter.put(
  "/:restaurantId/:menuId/items/:menuItemId",
  authenticate,
  authorizeRoles("restaurant_owner"),
  upload.single("image"),
  updateItem
);
// DELETE /api/v1/menu/items/:menuItemId --> Delete menu item --> Private (Restaurant Owner)
menuItemRouter.delete(
  "/:restaurantId/:menuId/items/:menuItemId",
  authenticate,
  authorizeRoles("restaurant_owner"),
  deleteItem
);
// PUT /api/v1/menu/items/:menuItemId/availability --> Toggle item availability --> Private (Restaurant Owner)
menuItemRouter.put(
  "/:restaurantId/:menuId/items/:menuItemId/availability",
  authenticate,
  authorizeRoles("restaurant_owner"),
  toggleAvailability
);
// PATCH /api/v1/menu/items/:menuItemId/price --> Update item price --> Private (Restaurant Owner)
menuItemRouter.patch(
  "/:restaurantId/:menuId/items/:menuItemId/price",
  authenticate,
  authorizeRoles("restaurant_owner"),
  updatePrice
);

export default menuItemRouter;
