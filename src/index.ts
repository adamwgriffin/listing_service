import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env
mongoose.connect(
  `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`
)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

db.once('open', () => {
  console.log('Connected to MongoDB')

  const app = new Koa()

  const router = new Router()
  router.get('/ping', async (ctx) => {
    ctx.body = { message: 'pong' }
  })

  app.use(bodyParser())
  app.use(router.routes())

  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
})
