import mongoose from 'mongoose'
import { MongoDbOptions } from '../config'

beforeAll(async () => {
  // put your client connection code here, example with mongoose:
  const conn = await mongoose.connect(process.env['MONGO_URI'], MongoDbOptions)
  console.log(
    `beforeAll(): MongoMemoryServer connected in setupFile.ts: ${conn.connection.host}`
  )
})

afterAll(async () => {
  // put your client disconnection code here, example with mongodb:
  await mongoose.disconnect()
  console.log('afterAll(): MongoMemoryServer disconnected in setupFile.ts.')
})
