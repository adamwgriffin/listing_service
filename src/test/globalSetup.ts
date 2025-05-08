import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import config from '../config/test.config'

declare global {
  // eslint-disable-next-line no-var
  var __MONGOINSTANCE: MongoMemoryServer;
}

export default async function globalSetup() {
  if (config.Memory) {
    // Making it global because we don't want to create a new instance for every
    // test-suite
    const instance = await MongoMemoryServer.create()
    const uri = instance.getUri()
    globalThis.__MONGOINSTANCE = instance
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'))
  } else {
    process.env.MONGO_URI = `mongodb://${config.IP}:${config.Port}`
  }
  // The following is to make sure the database is clean before any test starts
  await mongoose.connect(`${process.env.MONGO_URI}/${config.Database}`)
  await mongoose.connection.db.dropDatabase()
  await mongoose.disconnect()
}
