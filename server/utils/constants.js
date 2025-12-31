const CONSTANTS = {
  // User roles
  USER_ROLES: {
    CUSTOMER: "customer",
    RESTAURANT_OWNER: "restaurant_owner",
    DELIVERY_PARTNER: "delivery_partner",
    ADMIN: "admin",
  },

  // Order statuses
  ORDER_STATUS: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    READY_FOR_PICKUP: "ready_for_pickup",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    FAILED: "failed",
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "partially_refunded",
  },

  // Payment methods
  PAYMENT_METHODS: {
    CARD: "card",
    UPI: "upi",
    WALLET: "wallet",
    COD: "cod",
    NETBANKING: "netbanking",
  },

  // Delivery partner status
  DELIVERY_STATUS: {
    OFFLINE: "offline",
    ONLINE: "online",
    BUSY: "busy",
    ON_BREAK: "on_break",
  },

  // Review moderation
  REVIEW_MODERATION: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },

  // Notification types
  NOTIFICATION_TYPES: {
    ORDER_PLACED: "order_placed",
    ORDER_CONFIRMED: "order_confirmed",
    ORDER_PREPARING: "order_preparing",
    ORDER_READY: "order_ready",
    ORDER_OUT_FOR_DELIVERY: "order_out_for_delivery",
    ORDER_DELIVERED: "order_delivered",
    ORDER_CANCELLED: "order_cancelled",
    PAYMENT_SUCCESS: "payment_success",
    PAYMENT_FAILED: "payment_failed",
    REFUND_INITIATED: "refund_initiated",
    REFUND_COMPLETED: "refund_completed",
    PROMO_CODE: "promo_code",
    RESTAURANT_UPDATE: "restaurant_update",
    GENERAL: "general",
  },

  FOOD_CATEGORIES: {
    VEG: "veg",
    NON_VEG: "non-veg",
    EGG: "egg",
    VEGAN: "vegan",
  },

  SPICE_LEVELS: {
    MILD: "mild",
    MEDIUM: "medium",
    HOT: "hot",
    EXTRA_HOT: "extra-hot",
    NONE: "none",
  },

  DIETARY_PREFERENCES: [
    "vegetarian",
    "vegan",
    "gluten-free",
    "halal",
    "jain",
    "none",
  ],

  ALLERGENS: ["nuts", "dairy", "gluten", "soy", "eggs", "shellfish", "fish"],

  RESTAURANT_FEATURES: [
    "outdoor-seating",
    "wifi",
    "parking",
    "air-conditioned",
    "live-music",
    "bar",
    "reservations",
  ],

  VEHICLE_TYPES: {
    BICYCLE: "bicycle",
    BIKE: "bike",
    SCOOTER: "scooter",
    CAR: "car",
  },

  TOKEN_EXPIRY: {
    ACCESS_TOKEN: "15m",
    REFRESH_TOKEN: "7d",
    PASSWORD_RESET: "1h",
    EMAIL_VERIFICATION: "24h",
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  FILE_SIZE_LIMITS: {
    AVATAR: 2 * 1024 * 1024,
    RESTAURANT_IMAGE: 5 * 1024 * 1024,
    MENU_ITEM_IMAGE: 3 * 1024 * 1024,
    REVIEW_IMAGE: 3 * 1024 * 1024,
  },

  ALLOWED_FILE_TYPES: {
    IMAGES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    DOCUMENTS: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  },

  RATE_LIMITS: {
    GENERAL: 100,
    AUTH: 5,
    OTP: 3,
  },

  EMAIL_TEMPLATES: {
    WELCOME: "welcome",
    EMAIL_VERIFICATION: "email_verification",
    PASSWORD_RESET: "password_reset",
    ORDER_CONFIRMATION: "order_confirmation",
    ORDER_DELIVERED: "order_delivered",
  },

  SMS_TEMPLATES: {
    OTP: "otp",
    ORDER_CONFIRMATION: "order_confirmation",
    ORDER_DELIVERED: "order_delivered",
  },
};

export default CONSTANTS;
