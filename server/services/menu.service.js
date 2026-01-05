import Menu from "../models/menu.model.js";

export const checkCategoryExists = async (restaurantId, name) => {
  const categoryExists = await Menu.findOne({
    restaurant: restaurantId,
    name: { $regex: `^${name}$`, $options: "i" },
  });
  return categoryExists;
};

export const createNewCategory = async (name, data, restaurantId) => {
  const category = await Menu.create({
    name,
    ...data,
    restaurant: restaurantId,
  });
  return category;
};

export const getUpdatedCategory = async (
  restaurantId,
  categoryId,
  updateData
) => {
  return Menu.findOneAndUpdate(
    { _id: categoryId, restaurant: restaurantId },
    updateData,
    { new: true, runValidators: true }
  );
};

export const getdeletedCategory = async (restaurantId, categoryId) => {
  return Menu.findOneAndDelete({
    _id: categoryId,
    restaurant: restaurantId,
  });
};
