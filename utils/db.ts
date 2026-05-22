import config from "./config.ts";
import logger from "./logger.ts";
import mongoose from "mongoose";

const connect = async () => {
  try {
    logger.info("connecting to", config.MONGODB_URI);
    await mongoose.connect(config.MONGODB_URI, { family: 4 });
    logger.info("connected to MongoDB");
  } catch (e) {
    if (e instanceof Error)
      logger.error("error connection to MongoDB:", e.message);
  }
};
const disconnect = async () => {
  await mongoose.disconnect();
  logger.info("disconected from MongoDB");
};
const drop = async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
};

export default { connect, disconnect, drop };
