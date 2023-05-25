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

export type PropertyStatus = 'active' | 'pending' | 'sold'

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
  waterfront?: boolean
  view?: boolean
  fireplace?: boolean
  basement?: boolean
  garage?: boolean
  newConstruction?: boolean
  pool?: boolean
  airConditioning?: boolean
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
    enum: PropertyStatuses,
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
  waterfront: {
    type: Boolean,
    default: false,
    index: true,
  },
  view: {
    type: Boolean,
    default: false,
    index: true,
  },
  fireplace: {
    type: Boolean,
    default: false,
    index: true,
  },
  basement: {
    type: Boolean,
    default: false,
    index: true,
  },
  garage: {
    type: Boolean,
    default: false,
    index: true,
  },
  newConstruction: {
    type: Boolean,
    default: false,
    index: true,
  },
  pool: {
    type: Boolean,
    default: false,
    index: true,
  },
  airConditioning: {
    type: Boolean,
    default: false,
    index: true,
  }
})

const Listing = model<IListingDocument>('Listing', ListingSchema)

export default Listing
