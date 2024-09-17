import type { Context } from 'koa'
import { geocode, getGeocodeParamsFromQuery } from '../lib/geocoder'

export const geocodeRequest = async (ctx: Context) => {
  ctx.body = (await geocode(getGeocodeParamsFromQuery(ctx.query))).data.results
}
