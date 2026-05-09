const Redis = require("ioredis");
const { env } = require("./env");
const { logger } = require("../utils/logger");

const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2
});

redis.on("error", error => logger.warn("Redis unavailable", { message: error.message }));

async function connectRedis() {
  if (redis.status === "wait" || redis.status === "end") {
    await redis.connect();
  }
}

module.exports = { redis, connectRedis };
