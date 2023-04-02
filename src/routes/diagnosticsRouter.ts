import Router from '@koa/router'
import { ping, check } from '../controllers/diagnosticsController'

export default new Router()
  .get('/ping', ping)
  .get('/check', check)
