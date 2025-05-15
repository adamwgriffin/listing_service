import {
  AddressType,
  GeocodeResult
} from "@googlemaps/google-maps-services-js";
import type { MultiPolygon, Polygon } from "@turf/turf";
import { bboxPolygon, intersect } from "@turf/turf";
import { type Context } from "koa";
import { getPaginationParams } from "../lib";
import { type GeocodeBoundaryContext } from "../controllers/listingSearchController";
import type { IBoundary } from "../models/BoundaryModel";
import listingSearchBoundaryView from "../views/listingSearchBoundaryView";
import listingSearchGeocodeNoBoundaryView from "../views/listingSearchGeocodeNoBoundaryView";
import type { BoundarySearchQueryParams } from "../zod_schemas/boundarySearchRequestSchema";
import type { ListingAddress } from "../zod_schemas/listingSchema";
import { listingAddressSchema } from "../zod_schemas/listingSchema";
import type { BoundsParams } from "../zod_schemas/listingSearchParamsSchema";
import {
  addressComponentsToListingAddress,
  isListingAddressType
} from "../lib/geocode";

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
  const boundsPolygon = boundsParamsToGeoJSONPolygon(bounds);
  return intersect(boundsPolygon, boundary)?.geometry;
};

/**
 * If bounds params are present, modify the boundary so that any parts that are
 * outside of the bounds will be removed. This way the search will only return
 * results that are within both the boundary + the bounds.
 */
export const getBoundaryGeometryWithBounds = (
  boundary: IBoundary,
  queryParams: BoundarySearchQueryParams
): Polygon | MultiPolygon => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = queryParams;
  if (bounds_north && bounds_east && bounds_south && bounds_west) {
    const bounds = { bounds_north, bounds_east, bounds_south, bounds_west };
    return (
      removePartsOfBoundaryOutsideOfBounds(bounds, boundary.geometry) ||
      boundary.geometry
    );
  } else {
    return boundary.geometry;
  }
};

export const listingAddressHasRequiredFields = (
  listingAddress: ListingAddress
) => listingAddressSchema.safeParse(listingAddress).success;

export const getAddressTypesFromParams = (address_types: string) =>
  address_types.split(",") as AddressType[];

export const getResponseForPlaceId = async (ctx: GeocodeBoundaryContext) => {
  const { place_id, address_types } = ctx.query;
  if (!place_id || !address_types) return;
  // If it's an address we will need to geocode so we can't just use place_id.
  // Logic in the controller handles that for the sake of effeciency
  if (isListingAddressType(getAddressTypesFromParams(address_types))) return;

  const boundary = await ctx.repositories.boundary.findByPlaceId(place_id);
  if (!boundary) {
    const { geometry } = (
      await ctx.geocodeService.getPlaceDetails({ place_id })
    ).data.result;
    if (!geometry) return;
    return listingSearchGeocodeNoBoundaryView(geometry.viewport);
  }
  const pagination = getPaginationParams(ctx.query);
  const results = await ctx.repositories.listing.findWithinBounds(
    boundary.geometry,
    ctx.query,
    pagination
  );
  return listingSearchBoundaryView(boundary, results, pagination);
};

export const getResponseForListingAddress = async (
  { address_components, place_id, geometry }: GeocodeResult,
  ctx: Context
) => {
  const listingAddress = addressComponentsToListingAddress(address_components);

  const listing = listingAddressHasRequiredFields(listingAddress)
    ? await ctx.repositories.listing.findByPlaceIdOrAddress(
        place_id,
        listingAddress
      )
    : await ctx.repositories.listing.findByPlaceId(place_id);
  return listingSearchGeocodeNoBoundaryView(geometry.viewport, listing);
};

export const getResponseForBoundary = async (
  { place_id, geometry }: GeocodeResult,
  ctx: GeocodeBoundaryContext
) => {
  const boundary = await ctx.repositories.boundary.findByPlaceId(place_id);
  if (!boundary) {
    return listingSearchGeocodeNoBoundaryView(geometry.viewport);
  }
  const pagination = getPaginationParams(ctx.query);
  const results = await ctx.repositories.listing.findWithinBounds(
    boundary.geometry,
    ctx.query,
    pagination
  );
  return listingSearchBoundaryView(boundary, results, pagination);
};
