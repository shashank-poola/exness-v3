import redisClient from "./index";
import type { RedisClient } from "./index";

export const publisher: RedisClient = redisClient.duplicate();
export const subscriber: RedisClient = redisClient.duplicate();
