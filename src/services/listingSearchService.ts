import {
  AddressType,
  GeocodeResult
} from "@googlemaps/google-maps-services-js";
import { bboxPolygon, feature, featureCollection, intersect } from "@turf/turf";
import type { MultiPolygon, Polygon } from "geojson";
import { type Context } from "koa";
import {
  addressComponentsToListingAddress,
  isListingAddressType
} from "../lib/geocode";
import type { IBoundary } from "../models/BoundaryModel";
import type { IBoundaryRepository } from "../respositories/BoundaryRepository";
import type { IListingRepository } from "../respositories/ListingRepository";
import type { BoundarySearchQueryParams } from "../zod_schemas/boundarySearchRequestSchema";
import { type GeocodeBoundaryRequest } from "../zod_schemas/geocodeBoundarySearchSchema";
import type { ListingAddress } from "../zod_schemas/listingSchema";
import { listingAddressSchema } from "../zod_schemas/listingSchema";
import type { BoundsParams } from "../zod_schemas/listingSearchParamsSchema";
import { boundsParamsSchema } from "../zod_schemas/listingSearchParamsSchema";

export interface PlaceIdLookupContext extends GeocodeBoundaryRequest {
  db: {
    listing: Pick<IListingRepository, "findWithinBounds">;
    boundary: Pick<IBoundaryRepository, "findByPlaceId">;
  };
}

/**
 * Converts a set of north/east/south/west coordinates into a rectangular polygon
 */
export const boundsParamsToGeoJSONPolygon = (bounds: BoundsParams): Polygon => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = bounds;
  return bboxPolygon([bounds_west, bounds_south, bounds_east, bounds_north])
    .geometry;
};

/**
 * Remove any parts of a boundary that are outside of a set of bounds. These
 * bounds typically represent the viewport of a map. The purpose of doing this
 * is adjust a geospatial boundary in order to avoid returning listings that are
 * outside the map viewport.
 */
const removePartsOfBoundaryOutsideOfBounds = (
  bounds: BoundsParams,
  boundary: Polygon | MultiPolygon
) => {
  return (
    intersect(
      featureCollection([
        feature(boundsParamsToGeoJSONPolygon(bounds)),
        feature(boundary)
      ])
    )?.geometry || null
  );
};

/**
 * If bounds params are present, modify the boundary so that any parts that are
 * outside of the bounds will be removed. This way the search will only return
 * results that are within both the boundary + the bounds.
 */
export const getBoundaryGeometryWithBounds = (
  boundary: IBoundary,
  queryParams: BoundarySearchQueryParams
) => {
  const parsed = boundsParamsSchema.safeParse(queryParams);
  if (parsed.success) {
    return removePartsOfBoundaryOutsideOfBounds(parsed.data, boundary.geometry);
  } else {
    return boundary.geometry;
  }
};

export const listingAddressHasRequiredFields = (
  listingAddress: ListingAddress
) => listingAddressSchema.safeParse(listingAddress).success;

export const getAddressTypesFromParams = (address_types: string) =>
  address_types.split(",") as AddressType[];

/**
 * Use place_id to finds a boundary and listings within it.
 */
export const getResultsForPlaceId = async (
  place_id: string,
  ctx: PlaceIdLookupContext
) => {
  const boundary = await ctx.db.boundary.findByPlaceId(place_id);
  if (!boundary) return;
  const results = await ctx.db.listing.findWithinBounds(
    boundary.geometry,
    ctx.query
  );
  return { boundary, results };
};

/**
 * Handle a boundary request that includes both place_id and address_types params. This is
 * typically data received from an autocomplete selection on the frontend.
 */
export const getResultsForPlaceIdRequest = async (
  ctx: PlaceIdLookupContext
) => {
  const { place_id, address_types } = ctx.query;
  // We need both place_id & address_types data in order to determine if we can
  // get the boundary
  if (!place_id || !address_types) return;
  // If it's a listing address we will want to geocode because the way we find
  // them requires additional geocode information. We return early to allow the
  // caller to take care of that.
  if (isListingAddressType(getAddressTypesFromParams(address_types))) return;
  return getResultsForPlaceId(place_id, ctx);
};

/**
 * Try to find a listing that matches a geocode result for street address
 * location, rather than a boundary, either by address or place_id.
 */
export const getListingForListingAddressResult = async (
  { address_components, place_id }: GeocodeResult,
  ctx: Context
) => {
  const listingAddress = addressComponentsToListingAddress(address_components);
  // Avoid including address in the $or query if it's clear that the geocode
  // result doesn't have enough address data to ever succeed.
  return listingAddressHasRequiredFields(listingAddress)
    ? await ctx.db.listing.findByPlaceIdOrAddress(place_id, listingAddress)
    : await ctx.db.listing.findByPlaceId(place_id);
};
