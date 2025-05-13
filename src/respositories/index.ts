import { type ListingRepository, listingRepository } from './listingRepository'
import {
  type BoundaryRepository,
  boundaryRepository
} from './boundaryRepository'

export type Repositories = {
  listing: ListingRepository
  boundary: BoundaryRepository
}

const repositories = {
  listing: listingRepository,
  boundary: boundaryRepository
}

export default repositories
