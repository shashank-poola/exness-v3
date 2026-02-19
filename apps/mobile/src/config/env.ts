import Config from "react-native-config";
import { z } from "zod";

const EnvSchema = z.object({
    EXPO_PUBLIC_BACKEND_URL: z.string().url().optional(),
  });
  
export const env = EnvSchema.parse({
    EXPO_PUBLIC_BACKEND_URL: Config.EXPO_PUBLIC_BACKEND_URL,
});