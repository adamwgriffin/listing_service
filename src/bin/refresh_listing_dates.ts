import fs from "fs";
import path from "path";
import yargs from "yargs";
import { ensureError } from "../lib";
import {
  createListedDate,
  createOpenHouses,
  createSoldDate,
  ListingData
} from "../lib/random_data";

const DefaultFilePath = path.join(
  __dirname,
  "..",
  "data",
  "seed_data",
  "development",
  "dev_listings.json"
);

const processArgv = async () => {
  return yargs(process.argv.slice(2))
    .option("file", {
      alias: "f",
      type: "string",
      default: DefaultFilePath,
      describe:
        "Path to the file to use to load listing geocode data from, e.g., /app/data/my_file.json"
    })
    .option("output-path", {
      alias: "o",
      type: "string",
      default: DefaultFilePath,
      describe: "Path to save the file to save"
    })
    .alias("h", "help")
    .help("help")
    .usage(`Usage: $0 [options]`)
    .epilogue("Generate random Listing data from listing geocode data file")
    .argv;
};

const main = async () => {
  const argv = await processArgv();

  try {
    const listingData: ListingData[] = JSON.parse(
      fs.readFileSync(argv.file, "utf-8")
    );

    const today = new Date();

    for (const listing of listingData) {
      listing.listedDate = createListedDate(today);
      if (listing.status === "active" && !listing.rental) {
        listing.openHouses = createOpenHouses(listing.listedDate);
      }
      if (listing.status === "sold") {
        listing.soldDate = createSoldDate(listing.listedDate, today);
      }
    }

    console.log(`Refreshed ${listingData.length} listings.`);
    fs.writeFileSync(argv.outputPath, JSON.stringify(listingData, null, 2));
  } catch (error) {
    const errorMessage = ensureError(error);
    console.error("Encountered error generating listing data", errorMessage);
    process.exit(1);
  }
};

main();
