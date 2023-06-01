import type { Point } from '@turf/turf'
import { Schema, model } from 'mongoose'
import PointSchema from './PointSchema'

export interface IListingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export type PropertyType =
  | 'single-family'
  | 'condo'
  | 'townhouse'
  | 'manufactured'
  | 'land'
  | 'multi-family'

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented'

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
  start: Date;
  end: Date;
  comments?: string;
}

export interface IListing {
  listPrice: number
  soldPrice?: number
  listedDate: Date
  soldDate?: Date
  address: IListingAddress
  geometry: Point
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

export interface IListingDocument extends IListing, Document {}

export const PropertyTypes: PropertyType[] = [
  'single-family',
  'condo',
  'townhouse',
  'manufactured',
  'land',
  'multi-family'
]

export const PropertyStatuses: PropertyStatus[] = ['active', 'pending', 'sold']

export const RentalPropertyStatuses: PropertyStatus[] = ['active', 'rented']

export const AllPropertyStatuses: PropertyStatus[] = [
  'active',
  'pending',
  'sold',
  'rented'
]

const ListingSchema = new Schema<IListingDocument>({
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
        comments: { type: String },
      }
    ],
    default: [],
    required: false
  }
})

// looks like this is how we need to do the index if we plan on querying the fields inside the OpenHouses array.
ListingSchema.index({ 'openHouses.start': 1 })
ListingSchema.index({ 'openHouses.end': 1 })

const Listing = model<IListingDocument>('Listing', ListingSchema)

export default Listing
