import Router from "@koa/router";
import { getListingsById } from "../controllers/listingsController";
import { listingsRequestSchema } from "../zod_schemas/listingsRequestSchema";
import { parseAndValidateRequest } from "../middlewares/validationMiddleware";

export default new Router().get(
  "/:ids",
  parseAndValidateRequest(listingsRequestSchema),
  getListingsById
);
