import { connectToDatabase, disconnectDatabase } from "../database";

beforeAll(async () => {
  await connectToDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});
