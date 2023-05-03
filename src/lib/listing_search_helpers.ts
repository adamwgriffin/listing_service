import type { Polygon, MultiPolygon } from '@turf/turf'
import type { IBoundsParams } from './listing_search_params_types'
import { bboxPolygon, intersect } from '@turf/turf'

export const boundsParamsToGeoJSONPolygon = (bounds: IBoundsParams): Polygon => {
  const { boundsNorth, boundsEast, boundsSouth, boundsWest } = bounds
  return bboxPolygon([
    boundsWest,
    boundsSouth,
    boundsEast,
    boundsNorth
  ]).geometry
}

export const removePartsOfBoundaryOutsideOfBounds = (
  bounds: IBoundsParams,
  boundary: Polygon | MultiPolygon
): Polygon | MultiPolygon => {
  const boundsPolygon = boundsParamsToGeoJSONPolygon(bounds)
  return intersect(boundsPolygon, boundary).geometry
}
