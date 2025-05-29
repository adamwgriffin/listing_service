import pino from "pino";
import env from "./env";

const loggerOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL
};

if (env.NODE_ENV === "development") {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true
    }
  };
}

const logger = pino(loggerOptions);

export default logger;
