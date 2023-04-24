import Router from '@koa/router'
import { geocodeRequest } from '../controllers/geocoderController'

export default new Router()
  .get('/', geocodeRequest)
