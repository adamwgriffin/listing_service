import type { Polygon, MultiPolygon } from '@turf/turf'
import { bboxPolygon, intersect } from '@turf/turf'

export interface iBoundsParams {
  boundsNorth: number
  boundsEast: number
  boundsSouth: number
  boundsWest: number
}

export const boundsParamsToGeoJSONPolygon = (bounds: iBoundsParams): Polygon => {
  const { boundsNorth, boundsEast, boundsSouth, boundsWest } = bounds
  return bboxPolygon([
    boundsWest,
    boundsSouth,
    boundsEast,
    boundsNorth
  ]).geometry
}

export const removePartsOfBoundaryOutsideOfBounds = (
  bounds: iBoundsParams,
  boundary: Polygon | MultiPolygon
): Polygon | MultiPolygon => {
  const boundsPolygon = boundsParamsToGeoJSONPolygon(bounds)
  return intersect(boundsPolygon, boundary).geometry
}
