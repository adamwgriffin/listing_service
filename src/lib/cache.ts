import KeyvRedis from "@keyv/redis";
import { createCache } from "cache-manager";
import { Keyv } from "keyv";
import env from "./env";
import logger from "./logger";

const keyvRedisStore = new KeyvRedis(env.REDIS_URL);

const keyv = new Keyv(keyvRedisStore, {
  namespace: "",
  useKeyPrefix: false
});

export const cache = createCache({
  stores: [keyv],
  ttl: env.CACHE_TTL
});

cache.on("set", ({ error }) => {
  if (error) {
    logger.error(error, "Cache set error");
  }
});
