import mongoose from "mongoose";
import logger from "./../../utils/logger.js";

const dbConnection = async () => {
  try {
    const mongoOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    const connect = await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    logger.info(`MongoDB connected: ${connect.connection.host}`);

    // Connection events
    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
    });

    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("Mongoose connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error(`MongoDB connection error:  ${error}`);
    process.exit(1);
  }
};

export default dbConnection;
