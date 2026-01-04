import express from "express";
import {
  addAddress,
  deleteAddress,
  getAddressById,
  getAllAddresses,
  getDeliveryEstimate,
  getNearbyRestaurants,
  setDefaultAddress,
  updateAddress,
  validateAddress,
} from "../controllers/address.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const addressRouter = express.Router();

// add adddress
addressRouter.post("/add-new-address", authenticate, addAddress);
// get all addresses
addressRouter.get("/get-all-addresses", authenticate, getAllAddresses);
// get addresse by id
addressRouter.get("/get-address/:addressId", authenticate, getAddressById);
// update address
addressRouter.put("/update-address/:addressId", authenticate, updateAddress);
// delete address
addressRouter.delete("/delete-address/:addressId", authenticate, deleteAddress);
// set default address
addressRouter.put(
  "/set-default-address/:addressId",
  authenticate,
  setDefaultAddress
);
// validate address
addressRouter.get(
  "/validate-address/:addressId",
  authenticate,
  validateAddress
);
// get nearby restaurants
addressRouter.get(
  "/get-nearby-restaurants",
  authenticate,
  getNearbyRestaurants
);
// get delivery estimate
addressRouter.get("/get-delivery-estimate", authenticate, getDeliveryEstimate);

export default addressRouter;
