import mongoose from "mongoose";
import slugify from "slugify";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    cuisines: [
      {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
    ],
    images: {
      cover: { type: String, default: null },
      logo: { type: String, default: null },
      gallery: [{ type: String }],
    },
    location: {
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: {
          type: String,
          required: true,
          match: [/^[0-9]{6}$/, "Invalid pincode"],
        },
        country: { type: String, default: "India" },
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
          validate: {
            validator: (v) =>
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90,
            message: "Invalid coordinates",
          },
        },
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Invalid phone number"],
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"],
      },
      website: String,
    },
    timings: {
      monday: { open: String, close: String, isClosed: Boolean },
      tuesday: { open: String, close: String, isClosed: Boolean },
      wednesday: { open: String, close: String, isClosed: Boolean },
      thursday: { open: String, close: String, isClosed: Boolean },
      friday: { open: String, close: String, isClosed: Boolean },
      saturday: { open: String, close: String, isClosed: Boolean },
      sunday: { open: String, close: String, isClosed: Boolean },
    },
    priceForTwo: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrder: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    packagingCharges: { type: Number, default: 0, min: 0 },
    deliveryTime: {
      min: { type: Number, default: 30 },
      max: { type: Number, default: 45 },
    },
    deliveryRadius: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      distribution: {
        five: { type: Number, default: 0 },
        four: { type: Number, default: 0 },
        three: { type: Number, default: 0 },
        two: { type: Number, default: 0 },
        one: { type: Number, default: 0 },
      },
    },
    isOpen: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isAcceptingOrders: { type: Boolean, default: true },
    isPureVeg: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    features: [
      {
        type: String,
        enum: [
          "wifi",
          "parking",
          "outdoor-seating",
          "air-conditioned",
          "live-music",
          "bar",
          "reservations",
        ],
      },
    ],
    license: {
      fssai: { type: String, required: true },
      gst: String,
    },
    bankDetails: {
      accountNumber: { type: String, select: false },
      ifsc: { type: String, select: false },
      bankName: String,
      accountHolderName: String,
    },
    commission: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    stats: {
      totalOrders: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      cancelledOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
    },
    offers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PromoCode",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

restaurantSchema.index({ "location.coordinates": "2dsphere" });
restaurantSchema.index({ name: "text", description: "text", cuisines: "text" });
restaurantSchema.index({ isFeatured: -1, "rating.average": -1 });
restaurantSchema.index({ createdAt: -1 });

restaurantSchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

restaurantSchema.virtual("isCurrentlyOpen").get(function () {
  if (!this.isOpen || !this.isAcceptingOrders) return false;

  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toTimeString().slice(0, 5);

  const today = this.timings?.[day];
  if (!today || today.isClosed) return false;

  return time >= today.open && time <= today.close;
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
