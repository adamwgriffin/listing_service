import type {
  FeatureCollection,
  Feature,
  Polygon,
  MultiPolygon
} from '@turf/turf'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'

type SeattleBoundaryFeatureCollection =
  | FeatureCollection<Polygon>
  | FeatureCollection<MultiPolygon>

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
  'seattle_neighborhood_boundaries-cleaned_up.json'
)

const processArgv = async () => {
  const argv = await yargs(process.argv.slice(2))
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
    .alias('h', 'help')
    .help('help')
    .usage(`Usage: $0 [options]`)
    .epilogue(
      'Clean up City of Seattle Neighborhood Map Atlas Neighborhoods ' +
        'FeatureCollection by removing/converting some neighborhoods'
    ).argv

  if (argv.help) {
    yargs.showHelp()
    process.exit(0)
  }

  return argv
}

// The same name is used for some features in the neighborhood file as is used in the "district" file. In general, it
// seems that what the city refers to as a "district" is actually what most people would consider to be the
// neighborhood boundary, so we are removing the neighborhood bounadry in favor of using the so called "district"
// version in the other file. The S_HOOD attribute being the same as L_HOOD seems to always indicate that this is a
// duplicate of a district bounadry. The district file only uses L_HOOD for it's names, so I guess we can surmise that
// L_HOOD is the same as district for all intents and purposes.
const removeDuplicateNeighborhoodNames = (
  neighborhoodFeatures: SeattleBoundaryFeature[]
) => {
  return neighborhoodFeatures.filter(
    (feature) => feature.properties.S_HOOD !== feature.properties.L_HOOD
  )
}

const fixNeighborhoodProperties = (
  neighborhoodFeatures: SeattleBoundaryFeature[]
) => {
  for (const feature of neighborhoodFeatures) {
    // This boundary seems to actually be for a neighborhood called "Adams" that I've never heard of but which appears
    // on the map inside of Ballard
    if (
      feature.properties.S_HOOD === 'Ballard' &&
      feature.properties.S_HOOD_ALT_NAMES === 'Adams'
    ) {
      feature.properties.S_HOOD = 'Adams'
      feature.properties.S_HOOD_ALT_NAMES = null
    }
  }
  return neighborhoodFeatures
}

const main = async () => {
  const argv = await processArgv()

  const neighborhoodCollection: SeattleBoundaryFeatureCollection = JSON.parse(
    fs.readFileSync(argv.file, 'utf-8')
  )
  const neighborhoodFeaturesFixed = fixNeighborhoodProperties(
    neighborhoodCollection.features
  )
  const neighborhoodFeaturesDeduped = removeDuplicateNeighborhoodNames(
    neighborhoodFeaturesFixed
  )
  fs.writeFileSync(
    argv.outputPath,
    JSON.stringify(neighborhoodFeaturesDeduped, null, 2)
  )
}

main()
