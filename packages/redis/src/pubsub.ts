import redisClient from "./index";
import type { RedisClient } from "./index";

export const publisher: RedisClient = redisClient.duplicate();
export const subscriber: RedisClient = redisClient.duplicate();

// Optional: connect duplicates immediately
await Promise.all([
  publisher.connect(),
  subscriber.connect(),
]);
