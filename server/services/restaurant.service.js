import Restaurant from "../models/restaurant.model.js";

export const addRestaurant = async (data) => {
  const restaurant = new Restaurant(data);
  await restaurant.save();
  return restaurant;
};

export const isRestaurantExists = async (name, owner) => {
  return await Restaurant.findOne({ name, owner });
};

export const findUserRestaurants = async (userId) => {
  return await Restaurant.find({ owner: userId });
};

export const userRestaurants = async (userId) => {
  return await Restaurant.find({ owner: userId }).sort({ createdAt: -1 });
};

export const getRestaurants = async () => {
  return await Restaurant.find({})
    .populate("owner", "name email role")
    .sort({ createdAt: -1 });
};

export const findRestaurantById = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  return restaurant;
};

export const findFeaturedRestaurants = async () => {
  return await Restaurant.find({
    isFeatured: true,
    isActive: true,
    isAcceptingOrders: true,
  })
    .sort({ "rating.average": -1, createdAt: -1 })
    .limit(5)
    .populate("owner", "name email");
};

export const findRestaurantBySlug = async (slug) => {
  return await Restaurant.findOne({ slug });
};

export const updateRestaurantById = async (id, data) => {
  return await Restaurant.findByIdAndUpdate(id, data, { new: true });
};
