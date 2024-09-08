import type { Context } from 'koa'
import { geocode, getGeocodeParamsFromQuery } from '../lib/geocoder'

export const geocodeRequest = async (ctx: Context) => {
  try {
    ctx.body = (await geocode(getGeocodeParamsFromQuery(ctx.query))).data.results
  } catch (error) {
    ctx.status = error.response.status || 500
    ctx.body = { error: error.message }
  }
}
