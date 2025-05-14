import type { Context, Middleware } from "koa";
import type { ErrorResponse } from "../types/listing_search_response_types";
import { HttpError } from "koa";

const GenericErrorMessage = "Internal Server Error";

// Based on https://github.com/koajs/koa/wiki/Error-Handling
export const errorMiddleware: Middleware = async (
  ctx: Context,
  next: () => Promise<unknown>
) => {
  try {
    await next();
  } catch (err) {
    let body: ErrorResponse;
    if (err instanceof HttpError) {
      ctx.status = err.status || 500;
      body = {
        errors: err.errors || [{ message: err.message || GenericErrorMessage }]
      };
    } else {
      ctx.status = 500;
      // Since we're unsure what type of error we have it's probably prudent not to send err.message back to the client
      body = { errors: [{ message: GenericErrorMessage }] };
    }
    ctx.body = body;
    ctx.app.emit("error", err, ctx);
  }
};
