import type { ControllerContext } from "../types";
import { ListingResultWithSelectedFields } from "../types/listing_search_response_types";
import type { ListingsRequest } from "../zod_schemas/listingsRequestSchema";

export type GetListingsContext = ControllerContext<
  ListingsRequest,
  { listings: ListingResultWithSelectedFields[] }
>;

export const getListingsById = async (ctx: GetListingsContext) => {
  const listings = await ctx.repositories.listing.findByListingIds(
    ctx.params.ids
  );
  ctx.body = { listings };
};
