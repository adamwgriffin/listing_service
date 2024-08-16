import type { ErrorResponse } from '../types/listing_search_response_types'

export default (error): ErrorResponse => ({ error: error.message })
