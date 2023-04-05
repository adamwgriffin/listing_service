import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import config from '../config/test.config'

export default async function globalSetup() {
  console.log('')
  console.log('globalSetup() configuring MongoMemoryServer')
  // Config to decided if an mongodb-memory-server instance should be used
  if (config.Memory) {
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create()
    const uri = instance.getUri()
    globalThis.__MONGOINSTANCE = instance
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'))
  } else {
    process.env.MONGO_URI = `mongodb://${config.IP}:${config.Port}`
  }

  console.log('Making sure the database is clean before tests start.')
  // The following is to make sure the database is clean before an test starts
  await mongoose.connect(`${process.env.MONGO_URI}/${config.Database}`)
  await mongoose.connection.db.dropDatabase()
  await mongoose.disconnect()
}
