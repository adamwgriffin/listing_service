import type { Context } from 'koa'
import type { IGeocodeBoundaryContext } from '../lib/listing_search_params_types'
import Listing from '../models/ListingModel'
import Boundary from '../models/BoundaryModel'
import {
  DefaultListingResultFields,
  DefaultMaxDistance,
  DefaultPageSize
} from '../config'
import {
  geocode,
  getBoundaryTypeFromGeocoderAddressTypes
} from '../lib/geocoder'
import {
  boundsParamsToGeoJSONPolygon,
  removePartsOfBoundaryOutsideOfBounds,
  buildfilterQueries,
  buildfilterQueriesObject
} from '../lib/listing_search_helpers'

export const geocodeBoundarySearch = async (ctx: IGeocodeBoundaryContext) => {
  try {
    // make the request to the geocode service
    const geocoderResult = await geocode(ctx.query)
    const { lat, lng } = geocoderResult.data.results[0].geometry.location
    const boundaryType = getBoundaryTypeFromGeocoderAddressTypes(geocoderResult.data.results[0].types)

    // search for a boundary that matches the geocoder response coordinates
    const boundaries = await Boundary.findBoundaries(lat, lng, boundaryType)

    const page_size = Number(ctx.query.page_size) || DefaultPageSize
    const page_index = Number(ctx.query.page_index) || 0

    if (boundaries.length === 0) {
      ctx.status = 404
      return ctx.body = {
        error: "No boundary found for query."
      }
    }

    const sort_by = ctx.query.sort_by || 'listedDate'
    // 1 == ascending, e.g., 1-10
    // -1 == descending, e.g., 10-1
    const sort_direction = ctx.query.sort_direction === 'asc' ? 1 : -1

    const results = await Listing.findWithinBounds(
      boundaries[0].geometry,
      ctx.query,
      sort_by,
      sort_direction,
      page_index,
      page_size
    )

    const r = results[0]
    const numberAvailable = r.metadata[0]?.numberAvailable || 0
    ctx.body = {
      listings: r.data,
      boundary: boundaries[0],
      geocoderResult: geocoderResult.data.results,
      pagination: {
        page: page_index,
        pageSize: page_size,
        numberReturned: r.data.length,
        numberAvailable: numberAvailable,
        numberOfPages: Math.ceil(numberAvailable / page_size)
      }
    }
  } catch (error) {
    ctx.status = error?.response?.status || 500
    ctx.body = { error: error.message }
  }
}

export const boundarySearch = async (ctx: Context) => {
  const { id } = ctx.params
  try {
    const boundary = await Boundary.findById(id)

    let boundaryGeometry
    const { bounds_north, bounds_east, bounds_south, bounds_west } = ctx.query
    // if bounds params are present, we want to modify the boundary so that any parts that are outside of the bounds
    // will be removed. this way the search will only return results that are within both the boundary & the bounds
    if (bounds_north && bounds_east && bounds_south && bounds_west) {
      const bounds = { bounds_north, bounds_east, bounds_south, bounds_west }
      boundaryGeometry = removePartsOfBoundaryOutsideOfBounds(
        bounds,
        boundary.geometry
      )
    } else {
      boundaryGeometry = boundary.geometry
    }

    const page_size = Number(ctx.query.page_size) || DefaultPageSize
    const page_index = Number(ctx.query.page_index) || 0
    const sort_by = ctx.query.sort_by || 'listedDate'
    const sort_direction = ctx.query.sort_direction === 'asc' ? 1 : -1

    const results = await Listing.aggregate([
      {
        $match: {
          $and: [
            {
              geometry: {
                $geoWithin: {
                  $geometry: boundaryGeometry
                }
              }
            },
            ...buildfilterQueries(ctx.query)
          ]
        }
      },
      { $sort: { [sort_by]: sort_direction } },
      {
        $facet: {
          metadata: [{ $count: 'numberAvailable' }],
          data: [
            { $skip: page_index * page_size },
            { $limit: page_size },
            { $project: DefaultListingResultFields }
          ]
        }
      }
    ])

    const r = results[0]
    const numberAvailable = r.metadata[0]?.numberAvailable || 0
    ctx.body = {
      listings: r.data,
      pagination: {
        page: page_index,
        pageSize: page_size,
        numberReturned: r.data.length,
        numberAvailable: numberAvailable,
        numberOfPages: Math.ceil(numberAvailable / page_size)
      }
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const boundsSearch = async (ctx: Context) => {
  const { bounds_north, bounds_east, bounds_south, bounds_west } = ctx.query
  const geoJSONPolygon = boundsParamsToGeoJSONPolygon({
    bounds_north,
    bounds_east,
    bounds_south,
    bounds_west
  })
  try {
    const page_size = Number(ctx.query.page_size) || DefaultPageSize
    const page_index = Number(ctx.query.page_index) || 0
    const sort_by = ctx.query.sort_by || 'listedDate'
    const sort_direction = ctx.query.sort_direction === 'asc' ? 1 : -1

    const results = await Listing.aggregate([
      {
        $match: {
          $and: [
            {
              geometry: {
                $geoWithin: {
                  $geometry: geoJSONPolygon
                }
              }
            },
            ...buildfilterQueries(ctx.query)
          ]
        }
      },
      { $sort: { [sort_by]: sort_direction } },
      {
        $facet: {
          metadata: [{ $count: 'numberAvailable' }],
          data: [
            { $skip: page_index * page_size },
            { $limit: page_size },
            { $project: DefaultListingResultFields }
          ]
        }
      }
    ])

    const r = results[0]
    const numberAvailable = r.metadata[0]?.numberAvailable || 0
    ctx.body = {
      listings: r.data,
      pagination: {
        page: page_index,
        pageSize: page_size,
        numberReturned: r.data.length,
        numberAvailable: numberAvailable,
        numberOfPages: Math.ceil(numberAvailable / page_size)
      }
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}

export const radiusSearch = async (ctx: Context) => {
  const { lat, lng, max_distance } = ctx.query
  const page_size = Number(ctx.query.page_size) || DefaultPageSize
  const page_index = Number(ctx.query.page_index) || 0
  const sort_by = ctx.query.sort_by || 'listedDate'
  const sort_direction = ctx.query.sort_direction === 'asc' ? 1 : -1

  try {
    const results = await Listing.aggregate([
      // $geoNear doesn't go inside of $match like the other queries because it is aggregation pipeline stage, not an
      // aggregation operator. also, you can only use $geoNear as the first stage of a pipeline.
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          maxDistance: Number(max_distance) || DefaultMaxDistance,
          spherical: true,
          distanceField: 'distance'
        }
      },
      {
        $match: buildfilterQueriesObject(ctx.query)
      },
      { $sort: { [sort_by]: sort_direction } },
      {
        $facet: {
          metadata: [{ $count: 'numberAvailable' }],
          data: [
            { $skip: page_index * page_size },
            { $limit: page_size },
            {
              // "distance" is the fieldname set in the  "distanceField" for the $geoNear query above
              $project: { ...DefaultListingResultFields, distance: 1 }
            }
          ]
        }
      }
    ])

    const r = results[0]
    const numberAvailable = r.metadata[0]?.numberAvailable || 0
    ctx.body = {
      listings: r.data,
      pagination: {
        page: page_index,
        pageSize: page_size,
        numberReturned: r.data.length,
        numberAvailable: numberAvailable,
        numberOfPages: Math.ceil(numberAvailable / page_size)
      }
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { message: error.message }
  }
}
