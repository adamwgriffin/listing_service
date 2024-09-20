import mongoose from 'mongoose'
import { MongoDbOptions } from '../config'

beforeAll(async () => {
  // MONGO_URI is set in the globalSetup file
  if (typeof process.env.MONGO_URI !== 'string') {
    console.error('MONGO_URI is not set')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGO_URI, MongoDbOptions)
})

afterAll(async () => {
  await mongoose.disconnect()
})
