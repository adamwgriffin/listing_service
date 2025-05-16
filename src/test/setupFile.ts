import mongoose from "mongoose";
import { MongoDbUrl } from "../config/databaseConfig";

beforeAll(async () => {
  await mongoose.connect(MongoDbUrl);
});

afterAll(async () => {
  await mongoose.connection.close();
});
