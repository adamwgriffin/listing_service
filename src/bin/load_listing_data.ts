import type { IListing } from '../models/listingModel'
import fs from 'fs'
import path from 'path'
import { connectToDatabase, disconnectDatabase } from '../database'
import Listing from '../models/listingModel'

const main = async (): Promise<void> => {
  try {
    await connectToDatabase()
    console.log("Creating listings...")
    const filePath = path.join(
      __dirname,
      '..',
      'test',
      'test_data',
      'listing_data',
      'random_listing_data.json'
    )
    const listingData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as IListing[]
    const listings = await Listing.create(listingData)
    console.log(`${listings.length} listings created.`)
    await disconnectDatabase()
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
