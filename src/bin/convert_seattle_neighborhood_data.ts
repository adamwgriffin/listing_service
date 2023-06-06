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

const DefaultFilePath = path.join(
  __dirname,
  '..',
  '..',
  'shape_files',
  'seattle_neighborhoods.geojson'
)

const DefaultOutputPath = path.join(
  __dirname,
  '..',
  'test',
  'test_data',
  'boundary_data',
  'seattle_neighborhood_boundaries.json'
)

const convertNeighborhoodFeatureToBoundary = (
  feature: Feature<Polygon> | Feature<MultiPolygon>
): IBoundary => {
  const name = `${feature.properties.S_HOOD}, Seattle, WA, USA`
  const coordinates =
    feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates
      : [feature.geometry.coordinates]
  return {
    name,
    type: 'neighborhood',
    geometry: {
      type: 'MultiPolygon',
      coordinates
    }
  }
}

const main = async (): Promise<void> => {
  const argv = await yargs(process.argv.slice(2))
    .option('file', {
      alias: 'f',
      type: 'string',
      default: DefaultFilePath,
      describe: 'Path to the file to use to load boundary data'
    })
    .alias('h', 'help')
    .help('help')
    .usage(`Usage: yarn ts-node $0 [options]`)
    .epilogue(
      'Convert City of Seattle Neighborhood Map Atlas Neighborhoods'+
      'FeatureCollection into an array of JSON Boundary objects'
    ).argv

  if (argv.help) {
    yargs.showHelp()
    process.exit(0)
  }

  try {
    console.log('Convertring FeatureCollection file to boundaries...')
    const featureCollection = JSON.parse(
      fs.readFileSync(argv.file, 'utf-8')
    ) as FeatureCollection<Polygon> | FeatureCollection<MultiPolygon>
    const boundaries = featureCollection.features.map((feature) => {
      return convertNeighborhoodFeatureToBoundary(feature)
    })
    fs.writeFileSync(DefaultOutputPath, JSON.stringify(boundaries))
    console.log(`Successfully wrote output to file at "${DefaultOutputPath}".`)
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
