import type { Context } from 'koa'
import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})
const apiKey = process.env.GOOGLE_MAPS_API_KEY

export const geocodeRequest = async (ctx: Context) => {
  const { address, placeId } = ctx.query
  let geocodeParams

  if (address) {
    geocodeParams = { address }
  } else if (placeId) {
    geocodeParams = { place_id: placeId }
  } else {
    ctx.status = 400
    ctx.body = {
      error: 'Either address or placeId query parameter is required'
    }
    return
  }

  try {
    const response = await client.geocode({
      params: { ...geocodeParams, key: apiKey },
      timeout: 1000 // milliseconds
    })
    ctx.body = response.data.results
  } catch (error) {
    ctx.status = error.response.status || 500
    ctx.body = { error: error.message }
  }
}
