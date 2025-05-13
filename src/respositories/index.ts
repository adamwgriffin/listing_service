import { type IListingRepository, ListingRepository } from './ListingRepository'
import {
  type IBoundaryRepository,
  BoundaryRepository
} from './BoundaryRepository'

export interface IRepositories {
  listing: IListingRepository
  boundary: IBoundaryRepository
}

const Repositories = {
  listing: ListingRepository,
  boundary: BoundaryRepository
}

export default Repositories
