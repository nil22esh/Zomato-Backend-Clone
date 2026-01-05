import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Menu category name is required"],
      trim: true,
      minlength: [2, "Menu name must be at least 2 characters"],
      maxlength: [50, "Menu name cannot exceed 50 characters"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate menu names per restaurant
menuSchema.index({ restaurant: 1, name: 1 }, { unique: true });
// Ordering menus in UI
menuSchema.index({ restaurant: 1, displayOrder: 1 });
// Fetch only active menus
menuSchema.index({ restaurant: 1, isActive: 1 });

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
