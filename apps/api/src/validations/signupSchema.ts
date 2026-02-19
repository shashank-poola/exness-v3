import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Invalid password')
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Invalid password'),
});