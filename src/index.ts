import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import dotenv from 'dotenv'

dotenv.config()

const app = new Koa()
const router = new Router()

router.get('/ping', async (ctx) => {
  ctx.body = { message: 'pong' }
})

app.use(bodyParser())
app.use(router.routes())

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})
