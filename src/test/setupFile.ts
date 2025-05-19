import mongoose from "mongoose";
import { MongoDbUrl } from "../lib/env";

beforeAll(async () => {
  await mongoose.connect(MongoDbUrl);
});

afterAll(async () => {
  await mongoose.connection.close();
});
