import type { IPolygon } from '../models/PolygonSchema'
import type { Polygon, MultiPolygon } from '@turf/turf'
import { bboxPolygon, intersect } from '@turf/turf'

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

export const removePartsOfBoundaryOutsideOfBounds = (
  bounds: iBoundsParams,
  boundary: Polygon | MultiPolygon
): Polygon | MultiPolygon => {
  const { boundsNorth, boundsEast, boundsSouth, boundsWest } = bounds
  const boundsPolygon = bboxPolygon([
    boundsWest,
    boundsSouth,
    boundsEast,
    boundsNorth
  ])
  return intersect(boundsPolygon, boundary).geometry
}
