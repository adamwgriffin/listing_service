import { MongoMemoryServer } from 'mongodb-memory-server'
import config from '../config/test.config'

export default async function globalTeardown() {
  console.log('globalTeardown() stopping MongoMemoryServer')
  // Config to decided if an mongodb-memory-server instance should be used
  if (config.Memory) {
    const instance: MongoMemoryServer = globalThis.__MONGOINSTANCE
    await instance.stop()
  }
}
