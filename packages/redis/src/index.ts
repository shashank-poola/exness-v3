import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

export const client = createClient({
  url: redisUrl,
});

// Connect when the app starts (optional — can be done elsewhere)
client.connect();

export type RedisClient = typeof client;

export default client;
