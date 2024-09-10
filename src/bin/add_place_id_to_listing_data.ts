import type { IListing } from '../models/ListingModel'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { reverseGeocode } from '../lib/geocoder'
import { sleep } from '../lib'

const DefaultOutputPath = path.join(
  __dirname,
  '..',
  '..',
  'data',
  'seed_data',
  'development',
  'dev_listings_with_place_ids.json'
)

const DefaultFilePath = path.join(
  __dirname,
  '..',
  '..',
  'data',
  'seed_data',
  'development',
  'dev_listings.json'
)

const processArgv = async () => {
  const argv = await yargs(process.argv.slice(2))
    .option('file', {
      alias: 'f',
      type: 'string',
      default: DefaultFilePath,
      describe:
        'Path to the file to use to load listing data, e.g., /app/data/my_file.json'
    })
    .option('number', {
      alias: 'n',
      type: 'number',
      default: 100,
      describe: 'Number of listings to update in a batch'
    })
    .option('sleep', {
      alias: 's',
      type: 'number',
      default: 0,
      describe:
        'Amount of time to sleep in milliseconds between updating batches of listings'
    })
    .option('output-path', {
      alias: 'o',
      type: 'string',
      default: DefaultOutputPath,
      describe: 'Path to save the update file to'
    })
    .alias('h', 'help')
    .help('help')
    .usage(`Usage: $0 [options]`).argv

  if (argv.help) {
    yargs.showHelp()
    process.exit(0)
  }

  return argv
}

const addPlaceIdToListing = async (listing: IListing) => {
  // lat/lng are stored backwards like lng/lat inside a geojson Point
  const [lng, lat] = listing.geometry.coordinates
  const geocoderResult = (await reverseGeocode(lat, lng)).data.results[0]
  if (!geocoderResult?.place_id) {
    console.warn(
      `No place_id found for reverseGeocode of ${listing.address.line1}. Nothing updated.`
    )
    return listing
  }
  listing.placeId = geocoderResult.place_id
  return listing
}

const updateListingData = async (listingsData: IListing[]) => {
  return await Promise.all(
    listingsData.map(async (listing) => await addPlaceIdToListing(listing))
  )
}

const main = async (): Promise<void> => {
  const argv = await processArgv()

  try {
    console.log('Updating listings...')
    console.log(`Processing listing data file: ${argv.file}`)
    const listingData = JSON.parse(
      fs.readFileSync(argv.file, 'utf-8')
    ) as IListing[]
    const updatedListings = []
    for (let i = 0; i < listingData.length; i += argv.number) {
      const listingBatch = listingData.slice(i, i + argv.number)
      const updatedListingBatch = await updateListingData(listingBatch)
      updatedListings.push(...updatedListingBatch)
      console.log(`Sleeping ${argv.sleep} ms between batches`)
      await sleep(argv.sleep)
    }
    fs.writeFileSync(argv.outputPath, JSON.stringify(updatedListings, null, 2))
    console.log('Listing update complete')
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
