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

export interface IListing {
  listPrice: number
  listedDate: Date
  address: IListingAddress
  geometry: Point
  neighborhood: string
  propertyType: PropertyType
  description?: string
  beds: number
  baths: number
  sqft: number
  lotSize: number
  yearBuilt: number
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

const ListingSchema = new Schema<IListingDocument>({
  listPrice: {
    type: Number,
    required: true,
    index: true
  },
  listedDate: {
    type: Date,
    required: true,
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
  }
})

const Listing = model<IListingDocument>('Listing', ListingSchema)

export default Listing
