import app from "./app.js";
import dbConnection from "./config/db/dbConnection.js";
import logger from "./utils/logger.js";

const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || "development";

// connect to database
dbConnection();

app.listen(port, () => {
  logger.info(`server is running on port ${port} in ${env} mode...`);
});
