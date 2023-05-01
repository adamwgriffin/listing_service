import * as turf from '@turf/turf'
import fs from 'fs'
import path from 'path'

export const bounds = {
  boundsNorth: 47.69196108041875,
  boundsEast: -122.35243876227011,
  boundsSouth: 47.62542076759343,
  boundsWest: -122.40599711187949,
}

const polygon = turf.bboxPolygon([
  bounds.boundsWest,
  bounds.boundsSouth,
  bounds.boundsEast,
  bounds.boundsNorth
])

const outputPath = path.join(
  __dirname,
  '..',
  'test',
  'test_data',
  'viewport_bounds',
  'viewport_bounds_test.json'
)

fs.writeFile(outputPath, JSON.stringify(polygon), (err) => {
  if (err) {
    console.error('Error writing to file:', err)
  } else {
    console.log(`Successfully wrote output to file at "${outputPath}".`)
  }
})
