import mongoose from 'mongoose'

const ListingSchema = new mongoose.Schema({
  listPrice: Number
})

const Listing = mongoose.model('Listing', ListingSchema)

export default Listing
