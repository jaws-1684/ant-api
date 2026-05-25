import { Redis } from "ioredis";
import config from "./config.ts";
import logger from "./logger.ts";

const redis = new Redis(config.REDIS_URL);
redis.on("connect", () => logger.info("[Redis]: Connected"));
redis.on("error", (err) => logger.error("[Redis Error]:", err.message));

export default redis;