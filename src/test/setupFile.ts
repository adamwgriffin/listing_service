import { connectToDatabase, disconnectDatabase } from "../database";
import { cache } from "../lib/cache";

beforeAll(async () => {
  await connectToDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
  // Jest will hang if we don't disconnect this manually
  await cache.disconnect();
});
