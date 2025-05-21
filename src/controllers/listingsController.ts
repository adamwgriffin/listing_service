import type { ControllerContext } from "../types";
import type { ListingsResponse } from '../types/listing_search_response_types';
import type { ListingsRequest } from "../zod_schemas/listingsRequestSchema";

export type GetListingsContext = ControllerContext<
  ListingsRequest,
  ListingsResponse
>;

export const getListingsById = async (ctx: GetListingsContext) => {
  const listings = await ctx.db.listing.findByListingIds(
    ctx.params.ids
  );
  ctx.body = { listings };
};
