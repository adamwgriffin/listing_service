import type { IBoundary } from '../models/BoundaryModel'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { geocode } from '../lib/geocoder'

const DefaultOutputPath = path.join(
  __dirname,
'..',
  'test',
  'test_data',
  'boundary_data',
  'boundaries_with_place_ids.json'
)

const DefaultFilePath = path.join(
  __dirname,
  '..',
  'test',
  'test_data',
  'boundary_data',
  'boundaries.json'
)

const processArgv = async () => {
  const argv = await yargs(process.argv.slice(2))
    .option('file', {
      alias: 'f',
      type: 'string',
      default: DefaultFilePath,
      describe:
        'Path to the file to use to load listing data, e.g., /app/src/my_file.json'
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const addPlaceIdToBoundary = async (boundary: IBoundary) => {
  const geocoderResult = (await geocode({ address: boundary.name })).data.results[0]
  if (!geocoderResult?.place_id) {
    console.warn(
      `No place_id found for ${boundary.name}. Nothing updated.`
    )
    return boundary
  }
  boundary.placeId = geocoderResult.place_id
  return boundary
}

const updateBoundaryData = async (boundaries: IBoundary[]) => {
  return await Promise.all(
    boundaries.map(async (boundary) => await addPlaceIdToBoundary(boundary))
  )
}

const main = async (): Promise<void> => {
  const argv = await processArgv()

  try {
    console.log('Updating listings...')
    console.log(`Processing boundary data file: ${argv.file}`)
    const boundaries = JSON.parse(
      fs.readFileSync(argv.file, 'utf-8')
    ) as IBoundary[]
    const updatedBoundaries: IBoundary[] = []
    for (let i = 0; i < boundaries.length; i += argv.number) {
      const boundaryBatch = boundaries.slice(i, i + argv.number)
      const updatedBoundaryBatch = await updateBoundaryData(boundaryBatch)
      updatedBoundaries.push(...updatedBoundaryBatch)
      console.log(`Sleeping ${argv.sleep} ms between batches`)
      await sleep(argv.sleep)
    }
    fs.writeFileSync(argv.outputPath, JSON.stringify(updatedBoundaries, null, 2))
    console.log('Boundary update complete')
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
