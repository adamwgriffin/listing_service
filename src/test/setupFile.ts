import mongoose from "mongoose";
import path from "path";
import { createBoundariesFromFile } from "../lib/seed_data";
import { MongoDbUrl } from "../config";

const BoundaryFilePath = path.join(
  __dirname,
  "..",
  "data",
  "seed_data",
  "test",
  "test_boundaries.json"
);

beforeAll(async () => {
  await mongoose.connect(MongoDbUrl);
  await createBoundariesFromFile(BoundaryFilePath);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
