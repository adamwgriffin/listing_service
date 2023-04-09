import mongoose from 'mongoose'
import GeoSchema from './GeoSchema'

const ListingSchema = new mongoose.Schema({
  listPrice: Number,
  geometry: GeoSchema
})

const Listing = mongoose.model('Listing', ListingSchema)

export default Listing
