import Router from '@koa/router'
import { getListingsById } from '../controllers/listingsController'

export default new Router().get('/:ids', getListingsById)
