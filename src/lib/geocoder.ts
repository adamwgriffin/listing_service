import type {
  AddressComponent,
  GeocodeRequest,
  ReverseGeocodeResponse
} from '@googlemaps/google-maps-services-js'
import type { BoundaryType } from '../models/BoundaryModel'
import { Client, AddressType } from '@googlemaps/google-maps-services-js'

export const GeocodeTimeout = 1000 // milliseconds

export interface AddressComponentAddress {
  streetNumber: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  neighborhood: string
}

export const AddressTypeToBoundaryTypeMapping: Map<AddressType, BoundaryType> =
  new Map([
    [AddressType.country, 'country'],
    [AddressType.administrative_area_level_1, 'state'],
    [AddressType.administrative_area_level_2, 'county'],
    [AddressType.postal_code, 'zip_code'],
    [AddressType.locality, 'city'],
    [AddressType.neighborhood, 'neighborhood']
  ])

export const getBoundaryTypeFromGeocoderAddressTypes = (
  types: AddressType[]
): BoundaryType => {
  if (types.includes(AddressType.school)) {
    return 'school'
  }
  return AddressTypeToBoundaryTypeMapping.get(types[0]) || 'neighborhood'
}

const googleMapsClient = new Client({})

// maps all the different types in an AddressComponent.types array to a specific address field
const AddressComponentMapping = {
  streetNumber: ['street_number'],
  streetAddress: ['street_address', 'route'],
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
  postalCode: ['postal_code'],
  neighborhood: ['neighborhood']
}

export const AddressComponentAddressTemplate = Object.freeze({
  streetNumber: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  neighborhood: ''
})

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

export const addressComponentsToAddress = (
  address_components: AddressComponent[]
): AddressComponentAddress => {
  const address = { ...AddressComponentAddressTemplate }

  address_components.forEach((component) => {
    for (const addressComponent in AddressComponentMapping) {
      if (
        AddressComponentMapping[addressComponent].includes(component.types[0])
      ) {
        address[addressComponent] = component.long_name
      }
    }
  })

  return address
}
