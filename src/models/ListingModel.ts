import type { MultiPolygon, Point, Polygon } from '@turf/turf'
import type { GeocodeBoundarySearchParams } from '../types/listing_search_params_types'
import type {
  ListingResultWithSelectedFields,
  ListingRadiusResultWithSelectedFields,
  ListingDetailResultWithSelectedFields
} from '../types/listing_search_response_types'
import type { PaginationParams } from '../types/listing_search_params_types'
import { Model, ProjectionFields, Schema, model } from 'mongoose'
import PointSchema from './PointSchema'
import {
  ListingResultProjectionFields,
  ListingRadiusResultProjectionFields,
  ListingDetailResultProjectionFields
} from '../config'
import {
  buildfilterQueries,
  buildfilterQueriesObject,
  listingSortQuery
} from '../lib/listing_search_helpers'

export const RequiredListingAddressFields = Object.freeze([
  'line1',
  'city',
  'state',
  'zip'
])

export const PropertyTypes = [
  'single-family',
  'condo',
  'townhouse',
  'manufactured',
  'land',
  'multi-family'
] as const

export const PropertyStatuses = ['active', 'pending', 'sold'] as const

export const RentalPropertyStatuses = ['active', 'rented'] as const

export const AllPropertyStatuses = [
  ...PropertyStatuses,
  ...RentalPropertyStatuses
]

export type PropertyType = (typeof PropertyTypes)[number]

export type PropertyStatus = (typeof AllPropertyStatuses)[number]

export interface ListingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export interface PhotoGalleryImage {
  galleryUrl: string // 1920x1080 (used for slideshow image)
  fullUrl: string // 853x480(used for listing detail image)
  smallUrl: string // 533x300 (used for listing card image)
  caption?: string
}

export interface PropertDetail {
  name: string
  details: string[]
}

export interface PropertDetailsSection {
  name: string
  description?: string
  details: PropertDetail[]
}

export interface OpenHouse {
  start: Date
  end: Date
  comments?: string
}

export interface IListing {
  listPrice: number
  soldPrice?: number
  listedDate: Date
  soldDate?: Date
  address: ListingAddress
  geometry: Point
  placeId?: string
  neighborhood: string
  propertyType: PropertyType
  status: PropertyStatus
  description?: string
  beds: number
  baths: number
  sqft: number
  lotSize: number
  yearBuilt: number
  rental?: boolean
  waterfront?: boolean
  view?: boolean
  fireplace?: boolean
  basement?: boolean
  garage?: boolean
  newConstruction?: boolean
  pool?: boolean
  airConditioning?: boolean
  photoGallery?: PhotoGalleryImage[]
  propertyDetails?: PropertDetailsSection[]
  openHouses?: OpenHouse[]
}

export interface IListingModel extends Model<IListing> {
  findWithinBounds<T = ListingResultWithSelectedFields>(
    boundaryGeometry: Polygon | MultiPolygon,
    query: GeocodeBoundarySearchParams,
    pagination: PaginationParams,
    fields?: ProjectionFields<T>
  ): Promise<ListingSearchAggregateResult<T>>

  findWithinRadius<T = ListingRadiusResultWithSelectedFields>(
    lat: number,
    lng: number,
    maxDistance: number,
    query: GeocodeBoundarySearchParams,
    pagination: PaginationParams,
    fields?: ProjectionFields<T>
  ): Promise<ListingSearchAggregateResult<T>>

  findByPlaceIdOrAddress<T = ListingDetailResultWithSelectedFields>(
    placeId: string,
    address: Partial<ListingAddress>,
    fields?: ProjectionFields<T>
  ): Promise<T>
}

export type ListingSearchAggregateResult<T> = {
  metadata: { numberAvailable: number }[]
  listings: Array<T>
}[]

const ListingSchema = new Schema<IListing, IListingModel>({
  listPrice: {
    type: Number,
    required: true,
    index: true
  },
  soldPrice: {
    type: Number,
    required: false,
    index: true
  },
  listedDate: {
    type: Date,
    required: true,
    index: true
  },
  soldDate: {
    type: Date,
    required: false,
    index: true
  },
  address: {
    line1: {
      type: String,
      required: true,
      minlength: 1
    },
    line2: String,
    city: {
      type: String,
      required: true,
      minlength: 1
    },
    state: {
      type: String,
      required: true,
      minlength: 1
    },
    zip: {
      type: String,
      required: true,
      minlength: 1
    }
  },
  geometry: {
    type: PointSchema,
    index: '2dsphere',
    required: true
  },
  placeId: {
    type: String,
    index: true
  },
  neighborhood: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    enum: PropertyTypes,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: AllPropertyStatuses,
    default: 'active',
    index: true
  },
  description: String,
  beds: {
    type: Number,
    required: true,
    index: true
  },
  baths: {
    type: Number,
    required: true,
    index: true
  },
  sqft: {
    type: Number,
    required: true,
    index: true
  },
  lotSize: {
    type: Number,
    required: true,
    index: true
  },
  yearBuilt: {
    type: Number,
    required: true,
    index: true
  },
  rental: {
    type: Boolean,
    required: false,
    index: true
  },
  waterfront: {
    type: Boolean,
    default: false,
    index: true
  },
  view: {
    type: Boolean,
    default: false,
    index: true
  },
  fireplace: {
    type: Boolean,
    default: false,
    index: true
  },
  basement: {
    type: Boolean,
    default: false,
    index: true
  },
  garage: {
    type: Boolean,
    default: false,
    index: true
  },
  newConstruction: {
    type: Boolean,
    default: false,
    index: true
  },
  pool: {
    type: Boolean,
    default: false,
    index: true
  },
  airConditioning: {
    type: Boolean,
    default: false,
    index: true
  },
  photoGallery: {
    type: [
      {
        galleryUrl: { type: String, required: true },
        fullUrl: { type: String, required: true },
        smallUrl: { type: String, required: true },
        caption: { type: String }
      }
    ],
    required: false,
    default: []
  },
  propertyDetails: {
    type: [
      {
        name: { type: String, required: true },
        description: { type: String },
        details: [
          {
            name: { type: String, required: true },
            details: { type: [String], required: true }
          }
        ]
      }
    ],
    required: false,
    default: [],
    index: true
  },
  openHouses: {
    type: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        comments: { type: String }
      }
    ],
    default: [],
    required: false
  }
})

/**
 * Find a listing by placeId first. If that fails, try address instead.
 */
ListingSchema.statics.findByPlaceIdOrAddress = async function <
  T = ListingDetailResultWithSelectedFields
>(
  this: IListingModel,
  placeId: IListing['placeId'],
  address: ListingAddress,
  fields: ProjectionFields<T> = ListingDetailResultProjectionFields
): Promise<T | null> {
  const addressQuery = {}
  for (const k in address) {
    addressQuery[`address.${k}`] = address[k]
  }
  return this.findOne<T>({ $or: [{ placeId }, addressQuery] }, fields)
}

ListingSchema.statics.findWithinBounds = async function <
  T = ListingResultWithSelectedFields
>(
  this: IListingModel,
  boundaryGeometry: Polygon | MultiPolygon,
  query: GeocodeBoundarySearchParams,
  { page_size, page_index }: PaginationParams,
  fields: ProjectionFields<T> = ListingResultProjectionFields
): Promise<ListingSearchAggregateResult<T>> {
  return this.aggregate([
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
          ...buildfilterQueries(query)
        ]
      }
    },
    { $sort: listingSortQuery(query) },
    // using the aggregation pipline in combination with $facet allows us to get the total number of documents that
    // match the query when using $skip & $limit for pagination. it allows us to count the total results from the
    // $match stage before they go through the $skip/$limit stages that will reduce the number of results returned.
    {
      $facet: {
        metadata: [
          // this part counts the total. "numberAvailable" is just a name for the field
          { $count: 'numberAvailable' }
        ],
        listings: [
          // $skip allows us to move ahead to each page in the results set by skipping the previous page results we
          // have already seen, while $limit only returns the amount per page. together they create a slice of the
          // result set represented as a "page"
          { $skip: page_index * page_size },
          { $limit: page_size },
          { $project: fields }
        ]
      }
    }
  ])
}

ListingSchema.statics.findWithinRadius = async function <
  T = ListingRadiusResultWithSelectedFields
>(
  this: IListingModel,
  lat: number,
  lng: number,
  maxDistance: number,
  query: GeocodeBoundarySearchParams,
  { page_size, page_index }: PaginationParams,
  fields: ProjectionFields<T> = ListingRadiusResultProjectionFields
): Promise<ListingSearchAggregateResult<T>> {
  return this.aggregate([
    // $geoNear doesn't go inside of $match like the other queries because it is aggregation pipeline stage, not an
    // aggregation operator. also, you can only use $geoNear as the first stage of a pipeline.
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        maxDistance: maxDistance,
        spherical: true,
        distanceField: 'distance'
      }
    },
    {
      $match: buildfilterQueriesObject(query)
    },
    { $sort: listingSortQuery(query) },
    {
      $facet: {
        metadata: [{ $count: 'numberAvailable' }],
        listings: [
          { $skip: page_index * page_size },
          { $limit: page_size },
          {
            $project: fields
          }
        ]
      }
    }
  ])
}

// looks like this is how we need to do the index if we plan on querying the fields inside the OpenHouses array.
ListingSchema.index({ 'openHouses.start': 1 })
ListingSchema.index({ 'openHouses.end': 1 })

export default model<IListing, IListingModel>('Listing', ListingSchema)
