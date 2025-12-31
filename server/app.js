import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

// load environment variables from env file
dotenv.config();
// intialize express app and variables
const app = express();

// body parser middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// cookieParser Middleware
app.use(cookieParser());
// cors middleware
app.use(cors());

// application routes
app.use("/api/v1/auth", authRouter);

// error handler
app.use(errorHandler);

// checking server health
app.get("/check-health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.ENV || "development",
  });
});

export default app;
