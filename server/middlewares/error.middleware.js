import { errorResponse } from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return errorResponse(res, {
    statusCode,
    message,
    errors: err.errors || null,
  });
};

export default errorHandler;
