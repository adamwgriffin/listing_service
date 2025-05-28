import { LatLngBounds } from "@googlemaps/google-maps-services-js";
import type { IBoundary } from "../models/BoundaryModel";
import type { IListing } from "../models/ListingModel";
import {
  ListingDetailResultProjectionFields,
  ListingResultProjectionFields
} from "../queries/listingQueries";

export type AdditionalListingResultFields = {
  _id: string;
  latitude: number;
  longitude: number;
};

export type ListingResult = Pick<
  IListing,
  Exclude<keyof typeof ListingResultProjectionFields, "latitude" | "longitude">
> &
  AdditionalListingResultFields;

export type ListingDetailResult = Pick<
  IListing,
  Exclude<
    keyof typeof ListingDetailResultProjectionFields,
    "latitude" | "longitude"
  >
> &
  AdditionalListingResultFields;

export type PaginationResponse = {
  page: number;
  pageSize: number;
  numberReturned: number;
  numberAvailable: number;
  numberOfPages: number;
};

export type ListingSearchResponse<T = ListingResult> = {
  listings: T[];
  pagination: PaginationResponse;
};

export type ListingDetailResponse = ListingDetailResult & {
  daysOnMarket: number;
};

export type ListingsResponse = { listings: ListingResult[] };

export type BoundarySearchResponse = ListingSearchResponse & {
  boundary: IBoundary;
};

export type GeocodeBoundarySearchResponse = Partial<ListingSearchResponse> & {
  boundary?: IBoundary;
  viewport?: LatLngBounds;
  listingDetail?: ListingDetailResult;
};
