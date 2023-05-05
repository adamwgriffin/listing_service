import * as turf from '@turf/turf'
import fs from 'fs'
import path from 'path'

export const bounds = {
  bounds_north: 47.69196108041875,
  bounds_east: -122.35243876227011,
  bounds_south: 47.62542076759343,
  bounds_west: -122.40599711187949,
}

const polygon = turf.bboxPolygon([
  bounds.bounds_west,
  bounds.bounds_south,
  bounds.bounds_east,
  bounds.bounds_north
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
