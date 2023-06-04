import type { IBoundary } from '../models/BoundaryModel'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { connectToDatabase, disconnectDatabase } from '../database'
import Boundary from '../models/BoundaryModel'

const DefaultFilePath = path.join(
  __dirname,
  '..',
  'test',
  'test_data',
  'boundary_data',
  'boundaries.json'
)

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
    .usage(`Usage: $0 [options]`)
    .argv

  if (argv.help) {
    yargs.showHelp()
    process.exit(0)
  }
  
  try {
    await connectToDatabase()
    console.log("Creating boundaries...")
    const boundaryData = JSON.parse(fs.readFileSync(argv.file, 'utf-8')) as IBoundary[]
    const boundaries = await Boundary.create(boundaryData)
    console.log(`${boundaries.length} boundaries created.`)
    await disconnectDatabase()
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
