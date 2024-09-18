import type { Context } from 'koa'
import type { GeocodeRequestQuery } from '../validators/geocodeRequestValidator'
import { geocode, getGeocodeParamsFromQuery } from '../lib/geocoder'
import { GeocodeResult } from '@googlemaps/google-maps-services-js'

export interface GeocodeRequestContext extends Context {
  query: GeocodeRequestQuery
  status: number
  body: GeocodeResult[]
}

export const geocodeRequest = async (ctx: GeocodeRequestContext) => {
  ctx.body = (await geocode(getGeocodeParamsFromQuery(ctx.query))).data.results
}
