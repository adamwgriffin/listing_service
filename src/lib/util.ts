import type { IPolygon } from '../models/PolygonSchema'

export interface iBoundsParams {
  boundsNorth: number
  boundsEast: number
  boundsSouth: number
  boundsWest: number
}

export const boundsParamsToGeoJSONPolygon = (bounds: iBoundsParams): IPolygon => {
  const { boundsNorth, boundsEast, boundsSouth, boundsWest } = bounds
  return {
    type: 'Polygon',
    coordinates: [
      [
        [boundsWest, boundsNorth], // Top-left
        [boundsEast, boundsNorth], // Top-right
        [boundsEast, boundsSouth], // Bottom-right
        [boundsWest, boundsSouth], // Bottom-left
        [boundsWest, boundsNorth] // Close the polygon
      ]
    ]
  }
}
