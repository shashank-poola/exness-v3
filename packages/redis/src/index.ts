import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const client = createClient({
  url: redisUrl,
});

// Don't auto-connect - let the app connect when ready
client.on('error', (err) => console.error('Redis Client Error:', err));

export type RedisClient = typeof client;

export default client;
