import type { IBoundary } from "../models/BoundaryModel";
import fs from "fs";
import Boundary from "../models/BoundaryModel";

export const createBoundariesFromFile = async (path: string) => {
  const boundaryData = JSON.parse(
    fs.readFileSync(path, "utf-8")
  ) as IBoundary[];
  const boundaries = await Boundary.create(boundaryData);
  return boundaries;
};
