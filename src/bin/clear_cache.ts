import { cache } from "../lib/cache";
import { ensureError } from "../lib";
import env from "../lib/env";

(async () => {
  if (env.NODE_ENV === "production") {
    console.error("This script is not intended to be run in production.");
    process.exit(1);
  }
  try {
    const cleared = await cache.clear();
    if (cleared) {
      console.log("Cache cleared sucessfuly.");
    } else {
      console.log("Cache was not sucessfully cleared");
    }
    await cache.disconnect();
  } catch (err) {
    const error = ensureError(err);
    console.log("Error clearing cache:", error);
  }
})();
