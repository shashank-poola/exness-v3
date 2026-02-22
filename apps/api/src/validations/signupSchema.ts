import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('INVALID_EMAIL_FORMAT'),
  password: z.string().min(6, 'INVALID_PASSWORD')
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'INVALID_PASSWORD'),
});