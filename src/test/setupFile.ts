import mongoose from 'mongoose'
import { MongoDbOptions } from '../config'

beforeAll(async () => {
  // put your client connection code goes here here
  await mongoose.connect(process.env['MONGO_URI'], MongoDbOptions)
})

afterAll(async () => {
  // put your client disconnection code goes here
  await mongoose.disconnect()
})
