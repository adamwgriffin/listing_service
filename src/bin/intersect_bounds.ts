import * as turf from '@turf/turf'
import fs from 'fs'
import path from 'path'
import fremontBoundary from '../test/test_data/boundary_data/fremont_boundary'
import viewportBoundsExcludingEasternFremont from '../test/test_data/bounds/viewport_bounds_excluding_eastern_fremont'

const viewportBoundsExcludingEasternFremontPolygon = turf.polygon(
  viewportBoundsExcludingEasternFremont.coordinates
)
const fremontBoundaryMultiPolygon = turf.multiPolygon(
  fremontBoundary.geometry.coordinates
)

const intersection = turf.intersect(
  viewportBoundsExcludingEasternFremontPolygon,
  fremontBoundaryMultiPolygon
)

const outputPath = path.join(
  __dirname,
  '..',
  'test',
  'test_data',
  'boundary_data',
  'viewport_bounds_difference.json'
)

fs.writeFile(outputPath, JSON.stringify(intersection), (err) => {
  if (err) {
    console.error('Error writing to file:', err)
  } else {
    console.log(`Successfully wrote output to file at "${outputPath}".`)
  }
})
