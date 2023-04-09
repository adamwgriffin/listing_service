import { Schema } from 'mongoose'

const GeoSchema: Schema = new Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
})

export default GeoSchema
