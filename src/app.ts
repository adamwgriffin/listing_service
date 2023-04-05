import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import * as dotenv from 'dotenv'
import router from './routes/router'

dotenv.config()

const app = new Koa()
app.use(bodyParser())
app.use(router.routes())

export default app
