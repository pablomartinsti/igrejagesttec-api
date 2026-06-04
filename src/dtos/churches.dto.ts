import { z } from 'zod';

export const updateChurchSchema = {
  name: z.string().min(1).optional(),
  cnpj: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  responsibleName: z.string().optional(),
};

const updateChurchObject = z.object(updateChurchSchema);
export type UpdateChurchDTO = z.infer<typeof updateChurchObject>;
