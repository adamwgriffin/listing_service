import type { MultiPolygon } from '@turf/turf'
import { Schema, model } from 'mongoose'
import MultiPolygonSchema from './MultiPolygonSchema'

export type BoundaryType =
  | 'neighborhood'
  | 'city'
  | 'zip_code'
  | 'county'
  | 'state'
  | 'country'
  | 'school_district'
  | 'school'

export interface IBoundary extends Document {
  name: string
  type: BoundaryType
  geometry: MultiPolygon
}

export const BoundarySchema = new Schema<IBoundary>({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'neighborhood',
      'city',
      'zip_code',
      'county',
      'state',
      'country',
      'school_district',
      'school'
    ],
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
