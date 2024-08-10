import { DefaultPageSize } from '../config'
import type { PaginationParams } from '../types/listing_search_params_types'

export const getPaginationParams = (
  query: Partial<PaginationParams>
): PaginationParams => {
  return {
    page_size: Number(query.page_size) || DefaultPageSize,
    page_index: Number(query.page_index) || 0
  }
}
