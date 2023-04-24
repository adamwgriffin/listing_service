import { connectToDatabase, disconnectDatabase } from '../database'
import Listing from '../models/listingModel'
import Boundary from '../models/BoundaryModel'
import fremontListingData from '../test/test_data/listing_data/fremont_listing_data'
import ballardListingData from '../test/test_data/listing_data/ballard_listing_data'
import fremontBoundary from '../test/test_data/boundary_data/fremont_boundary'
import ballardBoundary from '../test/test_data/boundary_data/ballard_boundary'

const main = async (): Promise<void> => {
  try {
    await connectToDatabase()
    console.log("Creating listings...")
    const listings = await Listing.create(fremontListingData.concat(ballardListingData))
    console.log(`${listings.length} listings created.`)
    console.log("Creating boundaries...")
    const boundaries = await Boundary.create([fremontBoundary, ballardBoundary])
    console.log(`${boundaries.length} Boundaries created.`)
    await disconnectDatabase()
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
