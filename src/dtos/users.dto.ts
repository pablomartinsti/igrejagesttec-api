import { z } from 'zod';

export const createUserSchema = {
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'TREASURER', 'PASTOR']).default('TREASURER'),
};

const createUserObject = z.object(createUserSchema);
export type CreateUserDTO = z.infer<typeof createUserObject>;
