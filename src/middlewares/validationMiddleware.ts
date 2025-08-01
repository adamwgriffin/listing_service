import type { Middleware } from "@koa/router";
import type { Context } from "koa";
import type { ZodSafeParseSuccess, ZodType } from "zod";
import { type $ZodIssue } from "zod/v4/core";
import {
  type ErrorResponse,
  type ServiceError
} from "../zod_schemas/errorSchema";

type RequestLike = {
  params?: unknown;
  query?: unknown;
  body?: unknown;
};

const formatError = (issue: $ZodIssue) => {
  const err: ServiceError = {
    message: issue.message
  };
  if (issue.path.length) {
    err.field = issue.path.join(".");
  }
  return err;
};

// Parsing the data will convert the values from strings into the correct types
// defined in the schema since it will be using `.coerce()`. We will want to use
// these converted values later on in the controller so we update ctx.
const assignParsedResultToContext = (
  result: ZodSafeParseSuccess<RequestLike>,
  ctx: Context
) => {
  if (result.data.body) {
    ctx.body = result.data.body;
  }
  if (result.data.query) {
    // We're using Object.assign for this because ctx.query is not a POJO, it's
    // a getter so, we need to use Object.assign as an interface for mutating it
    // instead.
    Object.assign(ctx.query, result.data.query);
  }
  if (result.data.params) {
    Object.assign(ctx.params, result.data.params);
  }
};

export const parseAndValidateRequest = (
  schema: ZodType<RequestLike>
): Middleware => {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const { body, query, params } = ctx;
    const result = schema.safeParse({ body, query, params });
    if (result.success) {
      assignParsedResultToContext(result, ctx);
    } else {
      const err: ErrorResponse = {
        errors: result.error.issues.map(formatError)
      };
      ctx.throw(400, "Validation Error", err);
    }
    await next();
  };
};
