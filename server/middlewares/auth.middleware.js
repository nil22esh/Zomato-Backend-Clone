import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import User from "../models/user.model.js";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/errors.js";

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Access token required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Account has been deactivated");
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenError("Please verify your email first");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Invalid Token"));
    } else if (error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Token got expired"));
    } else {
      logger.error("Error occured while authenticating:", error);
      next(error);
    }
  }
};

export default authenticate;
