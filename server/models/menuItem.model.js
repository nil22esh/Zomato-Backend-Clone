import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      min: 0,
    },
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "egg", "vegan"],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra-hot", "none"],
      default: "none",
    },
    preparationTime: {
      type: Number,
      default: 15,
      min: 1,
    },
    servingInfo: {
      servings: { type: Number, default: 1 },
      portionSize: String,
    },
    nutrition: {
      calories: Number,
      protein: String,
      carbs: String,
      fat: String,
    },
    allergens: [
      {
        type: String,
        enum: ["nuts", "dairy", "gluten", "soy", "eggs", "shellfish", "fish"],
      },
    ],
    tags: [{ type: String, trim: true }],
    customizations: [
      {
        name: { type: String, required: true, trim: true },
        type: {
          type: String,
          enum: ["single", "multiple"],
          default: "single",
        },
        isRequired: { type: Boolean, default: false },
        options: [
          {
            name: { type: String, required: true },
            price: { type: Number, default: 0 },
            isDefault: { type: Boolean, default: false },
            isAvailable: { type: Boolean, default: true },
          },
        ],
      },
    ],
    addons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
menuItemSchema.index({ restaurant: 1, menu: 1 });
menuItemSchema.index({ menu: 1, displayOrder: 1 });
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });
menuItemSchema.index({ restaurant: 1, foodType: 1 });
menuItemSchema.index({ restaurant: 1, isBestseller: -1 });
menuItemSchema.index({ name: "text", description: "text", tags: "text" });

// Virtuals
menuItemSchema.virtual("effectivePrice").get(function () {
  return this.discountedPrice ?? this.price;
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
