import Router from '@koa/router'
import { geocodeRequest } from '../controllers/geocoderController'
import { parseAndValidateRequest } from '../middlewares/validationMiddleware'
import { geocodeRequestSchema } from '../zod_schemas/geocodeRequestSchema'

export default new Router().get(
  '/',
  parseAndValidateRequest(geocodeRequestSchema),
  geocodeRequest
)
