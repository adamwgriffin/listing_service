import { buildApp } from "./app";
import { connectToDatabase, disconnectDatabase } from "./database";
import env from "./lib/env";
import logger from "./lib/logger";
import httpLoggerMiddleware from "./middlewares/httpLoggerMiddleware";

const startServer = async () => {
  try {
    await connectToDatabase();
    const app = buildApp([httpLoggerMiddleware]);
    app.on("error", (err) => {
      logger.error({ err }, "Server error");
    });
    app.listen(env.APP_PORT, () => {
      logger.info(`Server listening on port ${env.APP_PORT} 🚀`);
    });
    process.on("SIGTERM", async () => {
      logger.debug("Cleaning up before closing the server...");
      await disconnectDatabase();
      logger.debug("Cleanup complete. Closing the server...");
      process.exit(0);
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

startServer();
