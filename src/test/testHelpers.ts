import { booleanPointInPolygon } from "@turf/turf";
import type { MultiPolygon, Polygon, Point } from "geojson";
import BoundaryModel from "../models/BoundaryModel";
import ListingModel from "../models/ListingModel";
import { boundsParamsToGeoJSONPolygon } from "../services/listingSearchService";
import { type ListingResult } from "../types/listing_search_response_types";
import type { BoundsParams } from "../zod_schemas/listingSearchParamsSchema";

/**
 * The bounds params for the map viewport when it has been adjusted to fit the
 * Fremont boundary. These bounds would be present, for example, if the user did
 * a search for "Fremont, Seattle, WA" then chose the "Remove Boundary" option,
 * so that all the listings within the viewport are returned, instead of only
 * listings within the Fremont boundary.
 */
export const FremontViewportBounds: BoundsParams = {
  bounds_north: 47.69011227856514,
  bounds_east: -122.32789118536581,
  bounds_south: 47.62356960805306,
  bounds_west: -122.38144953497519
};

/**
 * Viewport bounds for when the map is adjusted so that the Fremont boundary is
 * outside the viewport. This would happen if the user did an intial search for
 * "Fremont, Seattle, WA", then dragged the map so that the boundary was no
 * longer visible.
 */
export const ViewportBoundsExcludingFremontBoundary: BoundsParams = {
  bounds_south: 47.643764,
  bounds_west: -122.397176,
  bounds_north: 47.665733,
  bounds_east: -122.367737
};

export const FremontViewportBoundsPoly = boundsParamsToGeoJSONPolygon(
  FremontViewportBounds
);

/**
 * Bounds params that are present when the map is adjusted so that the eastern
 * portion of the Fremont boundary is outside the viewport, along with points to
 * check if a listing is in or outside these bounds, etc.
 */
export const BoundsExcludingPartOfFremontBoundary = {
  // placeId ChIJN8s8bakVkFQROOxDzEy1P_I
  insideBoundsPoint: {
    type: "Point",
    coordinates: [-122.35601516553109, 47.65388837211665]
  } satisfies Point,

  // placeId ChIJDY8uhwEVkFQRogfuWpvAmkM
  outsideBoundsPoint: {
    type: "Point",
    coordinates: [-122.34277739343227, 47.64941723280969]
  } satisfies Point,

  boundsParams: {
    bounds_north: 47.69196108041875,
    bounds_east: -122.35243876227011,
    bounds_south: 47.62542076759343,
    bounds_west: -122.40599711187949
  } satisfies BoundsParams,

  get boundsPoly() {
    return boundsParamsToGeoJSONPolygon(this.boundsParams);
  }
};

export const listingsInsideBoundary = (
  bounds: MultiPolygon | Polygon,
  listings: ListingResult[]
) => {
  return listings.every((listing) =>
    booleanPointInPolygon([listing.longitude, listing.latitude], bounds)
  );
};

/** Get a listing id that does not exist in the database */
export const getNonExistingListingId = () => new ListingModel()._id.toString();

/** Get a boundary id that does not exist in the database */
export const getNonExistingBoundaryId = () =>
  new BoundaryModel()._id.toString();
