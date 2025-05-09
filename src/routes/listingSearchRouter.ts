import Router from '@koa/router'
import { parseAndValidateRequest } from '../middlewares/validationMiddleware'
import { geocodeBoundaryRequestSchema } from '../zod_schemas/geocodeBoundarySearchSchema'
import { boundarySearchRequestSchema } from '../zod_schemas/boundarySearchRequestSchema'
import { boundsSearchRequestSchema } from '../zod_schemas/boundsSearchRequestSchema'
import {
  geocodeBoundarySearch,
  boundarySearch,
  boundsSearch
} from '../controllers/listingSearchController'

export default new Router()
  .get(
    '/geocode',
    parseAndValidateRequest(geocodeBoundaryRequestSchema),
    geocodeBoundarySearch
  )
  .get(
    '/boundary/:id',
    parseAndValidateRequest(boundarySearchRequestSchema),
    boundarySearch
  )
  .get(
    '/bounds',
    parseAndValidateRequest(boundsSearchRequestSchema),
    boundsSearch
  )
