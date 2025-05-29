import pinoHttp from "pino-http";
import logger from "../lib/logger";
import type { Context, Middleware } from "koa";

const httpLogger = pinoHttp({ logger });

// Used for automatically logging http requests
const httpLoggerMiddleware: Middleware = async (
  ctx: Context,
  next: () => Promise<unknown>
) => {
  httpLogger(ctx.req, ctx.res);
  await next();
};

export default httpLoggerMiddleware;
