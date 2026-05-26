import IORedis from "ioredis";
import { config } from "./config";

export const redis = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("connect", () => console.log("[redis] connected"));
redis.on("error", (e) => console.error("[redis] error", e.message));
