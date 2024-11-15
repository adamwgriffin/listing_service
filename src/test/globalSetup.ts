import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import env from '../lib/env'
import config from '../config/test.config'

declare global {
  // eslint-disable-next-line no-var
  var __MONGOINSTANCE: MongoMemoryServer;
}

export default async function globalSetup() {
  // Config to decided if an mongodb-memory-server instance should be used
  if (config.Memory) {
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create()
    const uri = instance.getUri()
    globalThis.__MONGOINSTANCE = instance
    env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'))
  } else {
    env.MONGO_URI = `mongodb://${config.IP}:${config.Port}`
  }
  // The following is to make sure the database is clean before any test starts
  await mongoose.connect(`${env.MONGO_URI}/${config.Database}`)
  await mongoose.connection.db.dropDatabase()
  await mongoose.disconnect()
}
