import type { IPoint } from './PointSchema'
import { Schema, model } from 'mongoose'
import PointSchema from './PointSchema'

export interface IListing extends Document {
  listPrice: number
  geometry: IPoint
}

const ListingSchema = new Schema<IListing>({
  listPrice: Number,
  geometry: {
    type: PointSchema,
    required: true
  }
})

const Listing = model<IListing>('Listing', ListingSchema)

export default Listing
