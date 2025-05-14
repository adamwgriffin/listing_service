import { buildApp } from "./app";
import { connectToDatabase, disconnectDatabase } from "./database";
import env from "./lib/env";

const startServer = async (): Promise<void> => {
  try {
    await connectToDatabase();
    const app = buildApp();
    app.on("error", (err, ctx) => {
      console.error("Server error", err, ctx);
    });
    app.listen(env.APP_PORT, () => {
      console.log(`Server listening on port ${env.APP_PORT} 🚀`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const handleExit = async (): Promise<void> => {
  console.log("Cleaning up before closing the server...");
  await disconnectDatabase();
  console.log("Cleanup complete. Closing the server...");
  process.exit(0);
};

process.on("SIGTERM", handleExit);

startServer();
