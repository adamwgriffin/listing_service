import mongoose from "mongoose";
import { MongoDbUrl } from "../config";

beforeAll(async () => {
  await mongoose.connect(MongoDbUrl);
});

afterAll(async () => {
  await mongoose.connection.close();
});
