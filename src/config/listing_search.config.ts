export const DefaultListingResultFields = {
  listPrice: 1,
  beds: 1,
  baths: 1,
  sqft: 1,
  neighborhood: 1,
  description: 1,
  address: 1,
  latitude: { $arrayElemAt: ['$geometry.coordinates', 1] },
  longitude: { $arrayElemAt: ['$geometry.coordinates', 0] }
}

export const DefaultMaxDistance = 1609.34 // 1 mile in meters
