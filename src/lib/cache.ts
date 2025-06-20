import KeyvRedis from "@keyv/redis";
import { createCache } from "cache-manager";
import { Keyv } from "keyv";
import env from "./env";
import logger from "./logger";

const keyvRedisStore = new KeyvRedis(env.REDIS_URL);

const keyv = new Keyv({ store: keyvRedisStore });

export const cache = createCache({
  stores: [keyv],
  ttl: 7 * 24 * 60 * 60 * 1000 // 1 week
});

cache.on("set", ({ error }) => {
  if (error) {
    logger.error(error, "Cache set error");
  }
});
