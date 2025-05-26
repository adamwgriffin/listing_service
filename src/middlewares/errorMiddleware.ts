import type { Context, Middleware } from "koa";
import {
  type ErrorResponse,
  errorResponseSchema
} from "../zod_schemas/errorSchema";
import { ensureError } from "../lib";

const GenericErrorMessage = "Internal Server Error";

const getStatusCode = (err: Error) => {
  if ("statusCode" in err && typeof err.statusCode === "number") {
    return err.statusCode;
  }
  if ("status" in err && typeof err.status === "number") {
    return err.status;
  }
  return 500;
};

const formatBody = (err: Error): ErrorResponse => {
  const parsed = errorResponseSchema.safeParse(err);
  if (parsed.success) {
    return parsed.data;
  }
  return {
    errors: [{ message: err.message || GenericErrorMessage }]
  };
};

// The main point of this middleware is to try and make sure that errors are
// returned in a consistent format.
export const errorMiddleware: Middleware = async (
  ctx: Context,
  next: () => Promise<unknown>
) => {
  try {
    await next();
  } catch (error) {
    const err = ensureError(error);
    ctx.status = getStatusCode(err);
    ctx.body = formatBody(err);
    ctx.app.emit("error", err, ctx);
  }
};
