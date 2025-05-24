import type { ListingData } from "../../lib/random_data";

// Used to test the geocode endpoint
const geocodeListing: ListingData = {
  listPrice: 291000,
  listedDate: new Date("2024-07-23T18:12:28.228Z"),
  address: {
    line1: "4223 Francis Avenue North",
    line2: "",
    city: "Seattle",
    state: "Washington",
    zip: "98103"
  },
  geometry: {
    type: "Point",
    coordinates: [-122.35324225270843, 47.65873999049147]
  },
  placeId: "ChIJq67P76wVkFQRVS8PuN4Y2WU",
  neighborhood: "Fremont",
  propertyType: "single-family",
  status: "pending",
  description:
    "Apostolus custodia natus abeo. Cunae peior demergo adduco annus quae iure aedificium cattus dolores.",
  beds: 5,
  baths: 4,
  sqft: 4800,
  lotSize: 6400,
  yearBuilt: 1910,
  newConstruction: false,
  waterfront: false,
  view: true,
  fireplace: true,
  basement: false,
  garage: true,
  pool: false,
  airConditioning: false,
  photoGallery: [],
  propertyDetails: []
};

export default geocodeListing;
