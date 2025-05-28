import { isListingAddressType } from "../lib/geocode";
import {
  boundsParamsToGeoJSONPolygon,
  getBoundaryGeometryWithBounds,
  getResultsForPlaceId,
  getListingForListingAddressResult,
  getResultsForPlaceIdRequest
} from "../services/listingSearchService";
import { ControllerContext } from "../types";
import type {
  BoundarySearchResponse,
  GeocodeBoundarySearchResponse,
  ListingSearchResponse
} from "../types/listing_search_response_types";
import listingSearchBoundaryView from "../views/listingSearchBoundaryView";
import listingSearchGeocodeNoBoundaryView from "../views/listingSearchGeocodeNoBoundaryView";
import listingSearchView from "../views/listingSearchView";
import type { BoundarySearchRequest } from "../zod_schemas/boundarySearchRequestSchema";
import type { BoundsSearchRequest } from "../zod_schemas/boundsSearchRequestSchema";
import type { GeocodeBoundaryRequest } from "../zod_schemas/geocodeBoundarySearchSchema";

export type GeocodeBoundaryContext = ControllerContext<
  GeocodeBoundaryRequest,
  GeocodeBoundarySearchResponse
>;

export type BoundarySearchContext = ControllerContext<
  BoundarySearchRequest,
  BoundarySearchResponse
>;

export type BoundsSearchContext = ControllerContext<
  BoundsSearchRequest,
  ListingSearchResponse
>;

export const geocodeBoundarySearch = async (ctx: GeocodeBoundaryContext) => {
  // If we have a place_id then we may not need to make a request to the geocode
  // service
  const placeIdData = await getResultsForPlaceIdRequest(ctx);
  if (placeIdData) {
    ctx.body = listingSearchBoundaryView(
      placeIdData.boundary,
      placeIdData.results,
      ctx.query
    );
    return;
  }

  const geocodeResult = (
    await ctx.geocodeService.geocodeFromAvailableParam(ctx.query)
  ).data.results[0];

  if (isListingAddressType(geocodeResult.types)) {
    const listing = await getListingForListingAddressResult(geocodeResult, ctx);
    ctx.body = listingSearchGeocodeNoBoundaryView(
      geocodeResult.geometry.viewport,
      listing
    );
    return;
  }

  const boundaryData = await getResultsForPlaceId(geocodeResult.place_id, ctx);
  ctx.body = boundaryData
    ? listingSearchBoundaryView(
        boundaryData.boundary,
        boundaryData.results,
        ctx.query
      )
    : listingSearchGeocodeNoBoundaryView(geocodeResult.geometry.viewport);
};

export const boundarySearch = async (ctx: BoundarySearchContext) => {
  const { id } = ctx.params;
  const boundary = await ctx.db.boundary.findById(id);

  ctx.assert(boundary, 404, `No boundary found for boundary id ${id}.`);

  const bounds = getBoundaryGeometryWithBounds(boundary, ctx.query);
  if (bounds === null) {
    ctx.body = listingSearchBoundaryView(boundary, null, ctx.query);
    return;
  }

  const results = await ctx.db.listing.findWithinBounds(bounds, ctx.query);

  ctx.body = listingSearchBoundaryView(boundary, results, ctx.query);
};

export const boundsSearch = async (ctx: BoundsSearchContext) => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = ctx.query;
  const geoJSONPolygon = boundsParamsToGeoJSONPolygon({
    bounds_north,
    bounds_east,
    bounds_south,
    bounds_west
  });
  const results = await ctx.db.listing.findWithinBounds(
    geoJSONPolygon,
    ctx.query
  );
  ctx.body = listingSearchView(results, ctx.query);
};
