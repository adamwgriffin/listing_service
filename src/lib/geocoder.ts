import type { GeocodeRequest } from '@googlemaps/google-maps-services-js'
import { Client } from '@googlemaps/google-maps-services-js'

export const GeocodeTimeout = 1000 // milliseconds

const googleMapsClient = new Client({})

export const geocode = async (params: Partial<GeocodeRequest>, timeout=GeocodeTimeout) => {
  return googleMapsClient.geocode({
    params: { ...params, key: process.env.GOOGLE_MAPS_API_KEY },
    timeout
  })
}