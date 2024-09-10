import type {
  FeatureCollection,
  Feature,
  Polygon,
  MultiPolygon
} from '@turf/turf'
import type { IBoundary } from '../models/BoundaryModel'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { geocode } from '../lib/geocoder'
import { sleep } from '../lib'

type SeattleBoundaryFeature = Feature<Polygon> | Feature<MultiPolygon>

const DefaultFilePath = path.join(
  __dirname,
  '..',
  '..',
  'data',
  'boundary_data',
  'seattle',
  'original_data',
  'seattle_neighborhood_boundaries.geojson'
)

const DefaultOutputPath = path.join(
  __dirname,
  '..',
  '..',
  'data',
  'boundary_data',
  'seattle',
  'transformed',
  'seattle_neighborhood_boundaries_output.json'
)

let nameAttribute = 'S_HOOD'

const processArgv = async () => {
  const argv = await yargs(process.argv.slice(2))
    .option('name-attribute', {
      alias: 'a',
      type: 'string',
      default: 'S_HOOD',
      describe:
        'Which GeoJSON attribute has the neighborhood name. Neighborhood boundaries use the default of ' +
        'S_HOOD, district boundaries use L_HOOD'
    })
    .option('file', {
      alias: 'f',
      type: 'string',
      default: DefaultFilePath,
      describe:
        'Path to the file to use to load the input data, e.g., /app/data/my_file.json'
    })
    .option('output-path', {
      alias: 'o',
      type: 'string',
      default: DefaultOutputPath,
      describe: 'Path to save the output file to'
    })
    .option('number', {
      alias: 'n',
      type: 'number',
      default: 100,
      describe: 'Number per batch'
    })
    .option('sleep', {
      alias: 's',
      type: 'number',
      default: 0,
      describe: 'Amount of time to sleep in milliseconds between batches'
    })
    .alias('h', 'help')
    .help('help')
    .usage(`Usage: $0 [options]`)
    .epilogue(
      'Convert City of Seattle Neighborhood Map Atlas Neighborhoods' +
        'or Districts FeatureCollection into an array of JSON Boundary objects'
    ).argv

  if (argv.help) {
    yargs.showHelp()
    process.exit(0)
  }

  nameAttribute = argv.nameAttribute

  return argv
}

const getName = (feature: SeattleBoundaryFeature) =>
  `${feature.properties[nameAttribute]}, Seattle, WA, USA`

const getPlaceId = async (name: string) => {
  const placeId = (await geocode({ address: name })).data.results[0].place_id
  if (!placeId || placeId.trim() === '') {
    console.warn(`No place_id found for ${name}`)
  }
  return placeId
}

// We want all our own boundaries to be MultiPolygon for the sake of simplicity, so adding an extra [] for this
const getCoordinates = (feature: SeattleBoundaryFeature) =>
  feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates
    : [feature.geometry.coordinates]

const convertNeighborhoodFeatureToBoundary = async (
  feature: SeattleBoundaryFeature
): Promise<IBoundary> => {
  const name = getName(feature)
  const placeId = await getPlaceId(name)
  const coordinates = getCoordinates(feature)
  return {
    name,
    type: 'neighborhood',
    geometry: {
      type: 'MultiPolygon',
      coordinates
    },
    placeId
  }
}

const createBoundaries = async (boundaries: SeattleBoundaryFeature[]) => {
  return await Promise.all(
    boundaries.map(
      async (boundary) => await convertNeighborhoodFeatureToBoundary(boundary)
    )
  )
}

const createBoundariesInBatches = async (
  features: SeattleBoundaryFeature[],
  sleepTime: number,
  number: number
) => {
  const boundaries: IBoundary[] = []
  for (let i = 0; i < features.length; i += number) {
    const boundaryBatch = features.slice(i, i + number)
    const createdBoundaryBatch = await createBoundaries(boundaryBatch)
    boundaries.push(...createdBoundaryBatch)
    console.log(`Sleeping ${sleepTime} ms between batches`)
    await sleep(sleepTime)
  }
  return boundaries
}

const main = async () => {
  const argv = await processArgv()

  try {
    console.log('Convertring FeatureCollection file to boundaries...')
    const featureCollection:
      | FeatureCollection<Polygon>
      | FeatureCollection<MultiPolygon> = JSON.parse(
      fs.readFileSync(argv.file, 'utf-8')
    )
    const boundaries = await createBoundariesInBatches(
      featureCollection.features,
      argv.sleep,
      argv.number
    )
    fs.writeFileSync(argv.outputPath, JSON.stringify(boundaries, null, 2))
    console.log(`Successfully wrote output to file at "${DefaultOutputPath}".`)

    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
