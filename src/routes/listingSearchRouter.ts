import Router from '@koa/router'
import { parseQuery } from '../middlewares/validationMiddleware'
import { geocodeBoundarySearchSchema } from '../zod_schemas/geocodeBoundarySearchSchema'
import { boundarySearchParamsSchema } from '../zod_schemas/boundarySearchRequestSchema'
import { boundsSearchParamsSchema } from '../zod_schemas/boundsSearchRequestSchema'
import { radiusSearchParamsSchema } from '../zod_schemas/radiusSearchRequestSchema'
import {
  geocodeBoundarySearch,
  boundarySearch,
  boundsSearch,
  radiusSearch
} from '../controllers/listingSearchController'

export default new Router()
  .get(
    '/geocode',
    parseQuery(geocodeBoundarySearchSchema),
    geocodeBoundarySearch
  )
  .get('/boundary/:id', parseQuery(boundarySearchParamsSchema), boundarySearch)
  .get('/bounds', parseQuery(boundsSearchParamsSchema), boundsSearch)
  .get('/radius', parseQuery(radiusSearchParamsSchema), radiusSearch)
