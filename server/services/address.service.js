import mongoose from "mongoose";
import Address from "../models/address.model.js";
import Restaurant from "../models/restaurant.model.js";

export const createAndAddAddress = async ({
  user,
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
}) => {
  const address = new Address({
    user,
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
    isActive: true,
  });

  await address.save();
  return address;
};

export const getUserAddresses = async (userId) => {
  const addresses = await Address.find({ user: userId });
  return addresses;
};

export const findAddressById = async (addressId) => {
  return await Address.findById(addressId);
};

export const deleteAddressById = async (addressId, userId) => {
  return await Address.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(addressId),
    user: new mongoose.Types.ObjectId(userId),
  });
};

export const assignNextDefaultAddress = async (userId) => {
  return await Address.findOneAndUpdate(
    { user: userId, isDefault: false },
    { $set: { isDefault: true } },
    {
      sort: { createdAt: -1 },
      new: true,
    }
  );
};

export const unsetAllDefaultAddresses = async (userId) => {
  return await Address.updateMany(
    { user: userId, isDefault: true },
    { $set: { isDefault: false } }
  );
};

export const findDefaultAddress = async (userId) => {
  return await Address.findOne({
    user: userId,
    isDefault: true,
  });
};

export const findNearestRestaurants = async (coordinates) => {
  return await Restaurant.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: 5000,
      },
    },
    isActive: true,
    isAcceptingOrders: true,
  }).limit(20);
};
