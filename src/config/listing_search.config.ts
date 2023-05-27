// used for mongodb's $project section to select the fields we want to return in the response
export const DefaultListingResultFields = {
  status: 1,
  listPrice: 1,
  soldPrice: 1,
  listedDate: 1,
  beds: 1,
  baths: 1,
  sqft: 1,
  neighborhood: 1,
  description: 1,
  address: 1,
  latitude: { $arrayElemAt: ['$geometry.coordinates', 1] },
  longitude: { $arrayElemAt: ['$geometry.coordinates', 0] },
  rental: 1
}

export const DefaultListingDetailFeilds = {
  ...DefaultListingResultFields,
  propertyType: 1,
  yearBuilt: 1,
  soldDate: 1
}

export const DefaultMaxDistance = 1609.34 // 1 mile in meters

export const DefaultPageSize = 20
