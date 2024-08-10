import type { IErrorResponse } from '../types/listing_search_params_types'

export default (error): IErrorResponse => ({ error: error.message })
