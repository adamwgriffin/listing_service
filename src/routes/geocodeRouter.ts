import Router from '@koa/router'
import { geocodeRequest } from '../controllers/geocoderController'
import { validateQuery } from '../middlewares/validationMiddleware'
import { geocodeRequestValidator } from '../validators/geocodeRequestValidator'

export default new Router().get(
  '/',
  validateQuery(geocodeRequestValidator),
  geocodeRequest
)
