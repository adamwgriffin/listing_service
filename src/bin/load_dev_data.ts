import { connectToDatabase, disconnectDatabase } from '../database'
import Listing from '../models/listingModel'
import Boundary from '../models/BoundaryModel'
import fremontListingData from '../test/test_data/listing_data/fremont_listing_data'
import ballardListingData from '../test/test_data/listing_data/ballard_listing_data'

const main = async (): Promise<void> => {
  try {
    await connectToDatabase()
    console.log("Creating listings...")
    const listings = await Listing.create(fremontListingData.concat(ballardListingData))
    console.log(`${listings.length} listings created.`)
    await disconnectDatabase()
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
