import MenuItem from "../models/menuItem.model.js";

export const createMenuItem = (data) => {
  return MenuItem.create(data);
};

export const findMenuItemByName = (menuId, name) => {
  return MenuItem.findOne({
    menu: menuId,
    name: { $regex: `^${name}$`, $options: "i" },
  });
};

export const findMenuItemById = async (menuId, menuItemId, restaurantId) => {
  return await MenuItem.findOne({
    _id: menuItemId,
    menu: menuId,
    restaurant: restaurantId,
  });
};

export const findAndUpdateMenuItemById = async (
  menuId,
  menuItemId,
  restaurantId,
  updateData
) => {
  return await MenuItem.findOneAndUpdate(
    {
      _id: menuItemId,
      menu: menuId,
      restaurant: restaurantId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

export const removeItemById = async (
  menuId,
  menuItemId,
  restaurantId,
  session
) => {
  return await MenuItem.findOneAndDelete(
    {
      _id: menuItemId,
      menu: menuId,
      restaurant: restaurantId,
    },
    { session }
  );
};

export const updateMenuItemPrice = async (
  restaurantId,
  menuId,
  menuItemId,
  { price, discountedPrice }
) => {
  const item = await MenuItem.findOne({
    _id: menuItemId,
    restaurant: restaurantId,
    menu: menuId,
  });
  if (!item) {
    throw new NotFoundError("Menu item not found");
  }

  // Use existing price if not provided
  const finalPrice = price ?? item.price;

  if (discountedPrice !== undefined && discountedPrice > finalPrice) {
    throw new BadRequestError(
      "Discounted price cannot be greater than original price"
    );
  }

  if (price !== undefined) {
    item.price = Number(price);
  }

  if (discountedPrice !== undefined) {
    item.discountedPrice = Number(discountedPrice);
  }

  await item.save();
  return item;
};
