import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "other",
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[0-9]{6}$/, "Please provide a valid 6-digit pincode"],
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    geoSource: {
      type: String,
      enum: ["manual", "google_maps", "mapbox"],
      default: "manual",
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    deliveryInstructions: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    priority: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
addressSchema.index({ user: 1 });
addressSchema.index({ location: "2dsphere" });
addressSchema.index({ pincode: 1 });
addressSchema.index({ isDefault: 1, user: 1 });

// Ensure only one default address per user
addressSchema.pre("save", async function () {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

const Address = mongoose.model("Address", addressSchema);
export default Address;
