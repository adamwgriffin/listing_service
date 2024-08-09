import type { MultiPolygon, Point, Polygon } from '@turf/turf'
import type {
  IGeocodeBoundarySearchParams,
  SortType
} from '../lib/listing_search_params_types'
import { Model, Document, ProjectionFields, Schema, model } from 'mongoose'
import PointSchema from './PointSchema'
import { DefaultListingResultFields } from '../config'
import { buildfilterQueries, buildfilterQueriesObject } from '../lib/listing_search_helpers'

export const PropertyTypes = [
  'single-family',
  'condo',
  'townhouse',
  'manufactured',
  'land',
  'multi-family'
] as const

export type PropertyType = (typeof PropertyTypes)[number]

export const PropertyStatuses = ['active', 'pending', 'sold'] as const

export const RentalPropertyStatuses = ['active', 'rented'] as const

export const AllPropertyStatuses = [
  ...PropertyStatuses,
  ...RentalPropertyStatuses
]

export type PropertyStatus = (typeof AllPropertyStatuses)[number]

export interface IListingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export interface IPhotoGalleryImage {
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

export interface IOpenHouse {
  start: Date
  end: Date
  comments?: string
}

export interface IListing {
  listPrice: number
  soldPrice?: number
  listedDate: Date
  soldDate?: Date
  address: IListingAddress
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
  photoGallery?: IPhotoGalleryImage[]
  propertyDetails?: PropertDetailsSection[]
  openHouses?: IOpenHouse[]
}

export interface IListingModel extends Model<IListing> {
  findWithinBounds(
    boundaryGeometry: Polygon | MultiPolygon,
    query: IGeocodeBoundarySearchParams,
    sortBy: SortType,
    SortDirection: 1 | -1,
    pageIndex: number,
    pageSize: number,
    fields?: ProjectionFields<IListing>
  ): Promise<Document<IListing>>

  findWithinRadius(
    lat: number,
    lng: number,
    maxDistance: number,
    query: IGeocodeBoundarySearchParams,
    sortBy: SortType,
    SortDirection: 1 | -1,
    pageIndex: number,
    pageSize: number,
    fields?: ProjectionFields<IListing>
  ): Promise<Document<IListing>>
}

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
      required: true
    },
    line2: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    }
  },
  geometry: {
    type: PointSchema,
    index: '2dsphere',
    required: true
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

ListingSchema.statics.findWithinBounds = async function (
  boundaryGeometry: Polygon | MultiPolygon,
  query: IGeocodeBoundarySearchParams,
  sortBy: SortType,
  sortDirection: 1 | -1,
  pageIndex: number,
  pageSize: number,
  fields: ProjectionFields<IListing> = DefaultListingResultFields
) {
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
    { $sort: { [sortBy]: sortDirection } },
    // using the aggregation pipline in combination with $facet allows us to get the total number of documents that
    // match the query when using $skip & $limit for pagination. it allows us to count the total results from the
    // $match stage before they go through the $skip/$limit stages that will reduce the number of results returned.
    {
      $facet: {
        metadata: [
          // this part counts the total. "numberAvailable" is just a name for the field
          { $count: 'numberAvailable' }
        ],
        data: [
          // $skip allows us to move ahead to each page in the results set by skipping the previous page results we
          // have already seen, while $limit only returns the amount per page. together they create a slice of the
          // result set represented as a "page"
          { $skip: pageIndex * pageSize },
          { $limit: pageSize },
          { $project: fields }
        ]
      }
    }
  ])
}

ListingSchema.statics.findWithinRadius = async function (
  lat: number,
  lng: number,
  maxDistance: number,
  query: IGeocodeBoundarySearchParams,
  sortBy: SortType,
  sortDirection: 1 | -1,
  pageIndex: number,
  pageSize: number,
  fields: ProjectionFields<IListing> = DefaultListingResultFields
) {
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
    { $sort: { [sortBy]: sortDirection } },
    {
      $facet: {
        metadata: [{ $count: 'numberAvailable' }],
        data: [
          { $skip: pageIndex * pageSize },
          { $limit: pageSize },
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
