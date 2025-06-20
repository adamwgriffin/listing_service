import mongoose from "mongoose";
import { MongoDbUrl } from "./lib/env";
import logger from "./lib/logger";

mongoose.connection.on("error", (e) => {
  logger.error("MongoDB connection error:", e);
});

export const connectToDatabase = async (url: string = MongoDbUrl) => {
  try {
    const conn = await mongoose.connect(url);
    logger.debug(`MongoDB connected to host: ${conn.connection.host}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.debug("MongoDB disconnected");
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

export const databaseIsConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
