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

export interface IListing extends Document {
  listPrice: number
  listedDate: Date
  address: IListingAddress
  geometry: Point
  neighborhood: string
  description?: string
  beds: number
  baths: number
  sqft: number
  lot_size: number
  year_built: number
}

const ListingSchema = new Schema<IListing>({
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
  lot_size: {
    type: Number,
    required: true,
    index: true
  },
  year_built: {
    type: Number,
    required: true,
    index: true
  },
})

const Listing = model<IListing>('Listing', ListingSchema)

export default Listing
