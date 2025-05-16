import { DefaultPageSize } from "../config/listingSearchConfig";
import type {
  ListingFilterParams,
  PaginationParams
} from "../zod_schemas/listingSearchParamsSchema";

export const getPaginationParams = (
  query: Partial<ListingFilterParams>
): PaginationParams => {
  return {
    page_size: query.page_size || DefaultPageSize,
    page_index: query.page_index || 0
  };
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
