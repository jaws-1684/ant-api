import { Redis } from "ioredis";
import appConfig from "./config.ts";
import logger from "./logger.ts";

let redis: Redis;

const config = () => {
    if (!appConfig.TEST_ENV) {
        redis = new Redis(appConfig.REDIS_URL);
        redis.on("connect", () => logger.info("[Redis]: Connected"));
        redis.on("error", (err) => logger.error("[Redis Error]:", err.message));
    };
};
export { redis };
export default { config };