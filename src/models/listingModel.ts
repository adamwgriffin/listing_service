import type { Point } from '@turf/turf'
import { Schema, model } from 'mongoose'
import PointSchema from './PointSchema'

export interface IListing extends Document {
  listPrice: number
  neighborhood: string
  geometry: Point
}

const ListingSchema = new Schema<IListing>({
  listPrice: Number,
  neighborhood: String,
  geometry: {
    type: PointSchema,
    index: '2dsphere',
    required: true
  }
})

const Listing = model<IListing>('Listing', ListingSchema)

export default Listing
