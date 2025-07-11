import type { ControllerContext } from "../types";
import type { ListingDetailResponse } from "../types/listing_search_response_types";
import type { ListingDetailRequest } from "../zod_schemas/listingDetailRequestSchema";
import listingDetailView from "../views/listingDetailView";

export type GetListingDetailContext = ControllerContext<
  ListingDetailRequest,
  ListingDetailResponse
>;

export const getListingDetail = async (ctx: GetListingDetailContext) => {
  const { slug } = ctx.params;
  const listing = await ctx.db.listing.findBySlug(slug);
  ctx.assert(listing, 404, `Listing not found with slug ${slug}`);
  ctx.body = listingDetailView(listing);
};
