import request from 'supertest'
import app from '../../app'
import Boundary from '../../models/BoundaryModel'
import Listing from '../../models/ListingModel'
import type { ListingData } from '../../lib/random_data'
import type { ListingSearchResponse } from '../../types/listing_search_response_types'

const ViewportBoundsFremont = {
  bounds_north: 47.69011227856514,
  bounds_east: -122.32789118536581,
  bounds_south: 47.62356960805306,
  bounds_west: -122.38144953497519
}

const listingData: ListingData = {
  placeId: 'ChIJx-PUpKcVkFQRuyjbZcMero4',
  listPrice: 700000,
  listedDate: new Date(),
  address: {
    line1: '325 West Bertona Street',
    city: 'Seattle',
    state: 'WA',
    zip: '981119'
  },
  geometry: {
    type: 'Point',
    coordinates: [-122.36202928170573, 47.650447901587384]
  },
  beds: 2,
  baths: 1,
  sqft: 2345,
  lotSize: 234312,
  yearBuilt: 1984,
  neighborhood: 'Fremont',
  propertyType: 'single-family',
  status: 'active'
}

const outsideBoundsListingData: ListingData = {
  ...listingData,
  placeId: 'ChIJgSaVY10UkFQRatRdh9A5h-k',
  address: {
    line1: '5507 Latona Avenue Northeast',
    city: 'Seattle',
    state: 'WA',
    zip: '98105'
  },
  geometry: {
    type: 'Point',
    coordinates: [-122.3263041928006, 47.66905938924199]
  },
  neighborhood: 'Wallingford'
}

describe('listingSearchRouter', () => {
  describe('GET /listing/search/boundary/:id', () => {
    it('returns a successful status when a boundary with the given ID exists', async () => {
      const boundary = await Boundary.findOne().lean()
      const res = await request(app.callback()).get(
        `/listing/search/boundary/${boundary?._id}`
      )
      expect(res.status).toBe(200)
    })

    it('validates the boundary ID params type', async () => {
      const res = await request(app.callback()).get(
        `/listing/search/boundary/bad_id_type`
      )
      expect(res.status).toBe(400)
    })

    it('returns a not found status when a boundary with the given ID does not exist', async () => {
      const nonExistentId = new Boundary()._id.toString()
      const res = await request(app.callback()).get(
        `/listing/search/boundary/${nonExistentId}`
      )
      expect(res.status).toBe(404)
    })
  })

  describe('GET /listing/search/bounds', () => {
    it('validates that all bounds params are present', async () => {
      const res = await request(app.callback()).get(`/listing/search/bounds`)
      expect(res.status).toBe(400)
    })

    it('Only returns listings that are inside the bounds', async () => {
      const listingInsideBounds = await Listing.create(listingData)
      const listingOutsideBounds = await Listing.create(outsideBoundsListingData)

      const res = await request(app.callback())
        .get('/listing/search/bounds')
        .query(ViewportBoundsFremont)
      const data: ListingSearchResponse = res.body;
      const foundListingIds = data.listings.map((l) => l.placeId)
      expect(foundListingIds).toContain(listingInsideBounds.placeId)
      expect(foundListingIds).not.toContain(listingOutsideBounds.placeId)
    })
  })
})
