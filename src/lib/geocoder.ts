import type {
  AddressComponent,
  GeocodeRequest,
  ReverseGeocodeResponse
} from '@googlemaps/google-maps-services-js'
import type { BoundaryType } from '../models/BoundaryModel'
import type { IListingAddress } from '../models/ListingModel'
import { Client, AddressType } from '@googlemaps/google-maps-services-js'

export const GeocodeTimeout = 1000 // milliseconds

export const AddressTypeToBoundaryTypeMapping: Map<AddressType, BoundaryType> =
  new Map([
    [AddressType.country, 'country'],
    [AddressType.administrative_area_level_1, 'state'],
    [AddressType.administrative_area_level_2, 'county'],
    [AddressType.postal_code, 'zip_code'],
    [AddressType.locality, 'city'],
    [AddressType.neighborhood, 'neighborhood']
  ])

/**
 * Address types that usually belong to a residence, as opposed to city/state/zip types
 */
export const GeocodeResultListingAddressTypes: readonly AddressType[] =
  Object.freeze([
    AddressType.street_address,
    AddressType.premise,
    AddressType.subpremise
  ])

/**
 * Converts a geocoder a result type name into the name we use internally for the type field in a Boundary record
 */
export const getBoundaryTypeFromGeocoderAddressTypes = (
  types: AddressType[]
): BoundaryType | undefined => {
  if (types.includes(AddressType.school)) {
    return 'school'
  }
  return AddressTypeToBoundaryTypeMapping.get(types[0])
}

/**
 * Maps all the different types in an AddressComponent.types array to a specific address field that we use for a Listing
 * record.
 */
const AddressComponentMapping = Object.freeze({
  street_number: ['street_number'],
  street_address: ['street_address', 'route'],
  city: [
    'locality',
    'sublocality',
    'sublocality_level_1',
    'sublocality_level_2',
    'sublocality_level_3',
    'sublocality_level_4'
  ],
  state: [
    'administrative_area_level_1',
    'administrative_area_level_2',
    'administrative_area_level_3',
    'administrative_area_level_4',
    'administrative_area_level_5'
  ],
  zip: ['postal_code']
})

const googleMapsClient = new Client({})

export const geocode = async (
  params: Omit<GeocodeRequest['params'], 'key'>,
  timeout = GeocodeTimeout
) => {
  return googleMapsClient.geocode({
    params: { ...params, key: process.env.GOOGLE_MAPS_API_KEY },
    timeout
  })
}

export const reverseGeocode = async (
  lat: number,
  lng: number,
  result_type: AddressType[] = [AddressType.street_address]
): Promise<ReverseGeocodeResponse> => {
  const response = await googleMapsClient.reverseGeocode({
    params: {
      latlng: `${lat},${lng}`,
      result_type,
      key: process.env.GOOGLE_MAPS_API_KEY
    },
    timeout: GeocodeTimeout
  })
  if (response.status < 200 || response.status > 299) {
    throw new Error('Failed to fetch address')
  }
  return response
}

/**
 * Convert the address fields from a geocode result into the fields we use for a Listing address in the database
 */
export const addressComponentsToListingAddress = (
  addressComponents: AddressComponent[]
): Partial<IListingAddress> => {
  const address: Partial<IListingAddress> = {}
  let street_number = ''
  let street_address = ''

  addressComponents.forEach((component) => {
    for (const field in AddressComponentMapping) {
      if (!AddressComponentMapping[field].includes(component.types[0])) {
        continue
      }
      if (field === 'street_number') {
        street_number = component.long_name
      } else if (field === 'street_address') {
        street_address = component.long_name
      } else {
        address[field] = component.long_name
      }
    }
  })

  address.line1 = [street_number, street_address].join(' ').trim()

  return address
}

export const getNeighborhoodFromAddressComponents = (
  addressComponents: AddressComponent[]
) => {
  return addressComponents.find((component) =>
    component.types.includes(AddressType.neighborhood)
  )?.long_name
}

export const isListingAddressType = (type: AddressType) =>
  GeocodeResultListingAddressTypes.includes(type)
