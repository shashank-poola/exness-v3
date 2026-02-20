import { z } from "zod";

const EnvSchema = z.object({
    EXPO_PUBLIC_BACKEND_URL: z.string().url(),
    EXPO_PUBLIC_WS_URL: z.string().url().optional(),
  });

export const env = EnvSchema.parse({
    EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
    EXPO_PUBLIC_WS_URL: process.env.EXPO_PUBLIC_WS_URL,
});