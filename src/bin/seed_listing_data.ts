import type { IListing } from '../models/ListingModel'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { connectToDatabase, disconnectDatabase } from '../database'
import Listing from '../models/ListingModel'

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
    .alias('h', 'help')
    .help('help')
    .usage(`Usage: $0 [options]`).argv

  if (argv.help) {
    yargs.showHelp()
    process.exit(0)
  }

  return argv
}

const main = async (): Promise<void> => {
  const argv = await processArgv()

  try {
    await connectToDatabase()
    console.log('Creating listings...')
    const listingData = JSON.parse(
      fs.readFileSync(argv.file, 'utf-8')
    ) as IListing[]
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
