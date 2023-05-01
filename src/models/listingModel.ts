import type { Point } from '@turf/turf'
import { Schema, model } from 'mongoose'
import PointSchema from './PointSchema'

interface IListingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface IListing extends Document {
  listPrice: number
  beds: number
  baths: number
  sqft: number
  address: IListingAddress
  neighborhood: string
  description?: string
  geometry: Point
}

const ListingSchema = new Schema<IListing>({
  listPrice: {
    type: Number,
    required: true,
    index: true
  },
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
  neighborhood: {
    type: String,
    required: true
  },
  description: String,
  geometry: {
    type: PointSchema,
    index: '2dsphere',
    required: true
  }
})

const Listing = model<IListing>('Listing', ListingSchema)

export default Listing
