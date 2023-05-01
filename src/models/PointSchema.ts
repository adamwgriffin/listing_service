import type { Point } from '@turf/turf'
import { Schema } from 'mongoose'

const PointSchema = new Schema<Point>({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
})

export default PointSchema
