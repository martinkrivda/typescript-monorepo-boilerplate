import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export type User = z.infer<typeof userSchema>;
