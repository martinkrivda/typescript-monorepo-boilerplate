import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  active: z.boolean().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export type User = z.infer<typeof userSchema>;
