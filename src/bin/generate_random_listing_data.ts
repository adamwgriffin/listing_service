import type { IBoundary } from '../models/BoundaryModel'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import generateListingData from '../lib/random_data'
import fremontBoundary from '../test/test_data/boundary_data/fremont_boundary'
import ballardBoundary from '../test/test_data/boundary_data/ballard_boundary'

const DefaultOutputPath = path.join(
  __dirname,
  '..',
  'test',
  'test_data',
  'listing_data',
  'random_listing_data.json'
)

const main = async () => {
  const argv = await yargs(process.argv.slice(2))
    .option('number', {
      alias: 'n',
      type: 'number',
      default: 100,
      describe: 'Number of listings to create for each polygon'
    })
    .option('output-path', {
      alias: 'o',
      type: 'string',
      default: DefaultOutputPath,
      describe: 'Path to save the file to'
    })
    .alias('h', 'help')
    .help('help')
    .usage(`Usage: $0 [options]`).argv

  if (argv.help) {
    yargs.showHelp()
    process.exit(0)
  }

  const listings = await Promise.all(
    [fremontBoundary, ballardBoundary].map(async (boundary: IBoundary) => {
      return await generateListingData(boundary.geometry, argv.number)
    })
  )

  fs.writeFileSync(argv.outputPath, JSON.stringify(listings.flat(), null, 2))

  console.log(`Random listing data saved to "${argv.outputPath}".`)
}

main()
