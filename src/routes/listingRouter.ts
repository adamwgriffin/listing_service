import Router from "@koa/router";
import listingSearchRouter from "./listingSearchRouter";
import { getListingDetail } from "../controllers/listingController";
import { listingDetailRequestSchema } from "../zod_schemas/listingDetailRequestSchema";
import { parseAndValidateRequest } from "../middlewares/validationMiddleware";

export default new Router()
  .get(
    "/:slug",
    parseAndValidateRequest(listingDetailRequestSchema),
    getListingDetail
  )
  .use("/search", listingSearchRouter.routes());
