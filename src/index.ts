import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'

const app = new Koa()
const router = new Router()

router.get('/ping', async (ctx) => {
  ctx.body = { message: 'pong' }
})

app.use(bodyParser())
app.use(router.routes())

app.listen(3001, () => {
  console.log('Server listening on port 3001')
})
