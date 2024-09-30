import type { ControllerContext } from '../types'
import type { GeocodeRequest } from '../zod_schemas/geocodeRequestSchema'
import { geocode, getGeocodeParamsFromQuery } from '../lib/geocoder'
import { GeocodeResult } from '@googlemaps/google-maps-services-js'

export type GeocodeRequestContext = ControllerContext<
  GeocodeRequest,
  GeocodeResult[]
>

export const geocodeRequest = async (ctx: GeocodeRequestContext) => {
  ctx.body = (await geocode(getGeocodeParamsFromQuery(ctx.query))).data.results
}
