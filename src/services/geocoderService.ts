import {
  AddressType,
  Client,
  type GeocodeResponse,
  type PlaceDetailsRequest,
  type PlaceDetailsResponse,
  type ReverseGeocodeResponse
} from "@googlemaps/google-maps-services-js";
import env from "../lib/env";
import type {
  GeocodeRequestParams,
  PlaceDetailsRequestParams
} from "../lib/geocode";
import { type GeocodeParams } from "../zod_schemas/geocodeBoundarySearchSchema";

export interface IGeocoderService {
  geocode: (params: GeocodeRequestParams) => Promise<GeocodeResponse>;

  /**
   * Get params from query string. If place_id is available use that, otherwise
   * use address.
   */
  geocodeFromAvailableParam: (
    params: GeocodeParams
  ) => Promise<GeocodeResponse>;

  reverseGeocode: (
    lat: number,
    lng: number,
    result_type?: AddressType[]
  ) => Promise<ReverseGeocodeResponse>;

  getPlaceDetails: (
    params: PlaceDetailsRequestParams
  ) => Promise<PlaceDetailsResponse>;
}

export class GeocoderService implements IGeocoderService {
  constructor(
    private client: Client,
    private apiKey: string
  ) {}

  public async geocode(params: GeocodeRequestParams) {
    return this.client.geocode({
      params: { ...params, key: this.apiKey }
    });
  }

  public async geocodeFromAvailableParam({ place_id, address }: GeocodeParams) {
    const request = place_id ? { place_id } : { address };
    return this.geocode(request);
  }

  public async reverseGeocode(
    lat: number,
    lng: number,
    result_type: AddressType[] = [AddressType.street_address]
  ): Promise<ReverseGeocodeResponse> {
    const response = await this.client.reverseGeocode({
      params: {
        latlng: `${lat},${lng}`,
        result_type,
        key: this.apiKey
      }
    });
    if (response.status < 200 || response.status > 299) {
      throw new Error("Failed to fetch address");
    }
    return response;
  }

  public async getPlaceDetails(
    params: Omit<PlaceDetailsRequest["params"], "key">
  ) {
    return this.client.placeDetails({
      params: { ...params, key: this.apiKey }
    });
  }
}

export const createGeocodeService = () => {
  return new GeocoderService(new Client(), env.GOOGLE_MAPS_API_KEY);
};
