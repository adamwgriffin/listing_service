import type { MultiPolygon } from '@turf/turf'
import { Schema, model } from 'mongoose'
import MultiPolygonSchema from './MultiPolygonSchema'

export interface IBoundary extends Document {
  name: string
  type: 'neighborhood' | 'city' | 'zipcode' | 'county' | 'state' | 'country'
  geometry: MultiPolygon
}

export const BoundarySchema = new Schema<IBoundary>({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['neighborhood', 'city', 'zipcode', 'county', 'state', 'country'],
    required: true
  },
  geometry: {
    type: MultiPolygonSchema,
    // NOTE: it's very important that this index gets defined here, rather than on the coordinates in the
    // MultiPolygonSchema. putting them on the coordinates breaks things so that you can never creating a record
    // successfully
    index: '2dsphere',
    required: true
  }
})

const Boundary = model<IBoundary>('Boundary', BoundarySchema)

export default Boundary
