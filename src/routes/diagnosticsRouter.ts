import Router from '@koa/router'
import { ping } from '../controllers/diagnosticsController'

export default new Router()
  .get('/ping', ping)
