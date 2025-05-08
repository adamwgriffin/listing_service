import config from '../config/test.config'

export default async function globalTeardown() {
  if (config.Memory) {
    const instance = globalThis.__MONGOINSTANCE
    await instance.stop()
  }
}
