import { z } from 'zod';

export const registerSchema = {
  church: z.object({
    name: z.string().min(1),
    cnpj: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  }),
};

const registerObject = z.object(registerSchema);
export type RegisterDTO = z.infer<typeof registerObject>;

export const loginSchema = {
  email: z.string().email(),
  password: z.string().min(6),
};

const loginObject = z.object(loginSchema);
export type LoginDTO = z.infer<typeof loginObject>;
