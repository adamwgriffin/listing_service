import type {
  ListingFilterParams,
  PaginationParams
} from "../zod_schemas/listingSearchParamsSchema";

export const DefaultPageSize = 20;

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

/** Makes sure that the value caught in a try/catch block is an actural Error
 * type since JS allows any type to be thrown. */
export const ensureError = (value: unknown): Error => {
  if (value instanceof Error) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new Error(
    `This value was thrown as is, not through an Error: ${stringified}`
  );
  return error;
};
