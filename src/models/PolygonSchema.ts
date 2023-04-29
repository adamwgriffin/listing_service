import { Schema } from 'mongoose'

export interface IPolygon {
  type: 'Polygon'
  coordinates: Array<Array<[number, number]>>
}

const PolygonSchema = new Schema<IPolygon>({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]],
    required: true
  }
})

export default PolygonSchema
