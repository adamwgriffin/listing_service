import { booleanPointInPolygon } from "@turf/turf";
import type { MultiPolygon, Polygon, Point } from "geojson";
import BoundaryModel from "../models/BoundaryModel";
import ListingModel from "../models/ListingModel";
import { boundsParamsToGeoJSONPolygon } from "../services/listingSearchService";
import { type ListingResult } from "../types/listing_search_response_types";
import type { BoundsParams } from "../zod_schemas/listingSearchParamsSchema";

export const FremontViewportBounds = {
  bounds_north: 47.69011227856514,
  bounds_east: -122.32789118536581,
  bounds_south: 47.62356960805306,
  bounds_west: -122.38144953497519
};

export const FremontViewportBoundsPolygon = boundsParamsToGeoJSONPolygon(
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

export const getNonExistingBoundaryId = () =>
  new BoundaryModel()._id.toString();
