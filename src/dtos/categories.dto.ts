import { z } from 'zod';

export const createCategorySchema = {
  title: z.string().min(1).max(255),
  color: z.string().regex(/^#[A-Fa-f0-9]{6}$/),
};

const createCategoryObject = z.object(createCategorySchema);
export type CreateCategoryDTO = z.infer<typeof createCategoryObject>;

export const updateCategorySchema = {
  title: z.string().min(1).max(255).optional(),
  color: z
    .string()
    .regex(/^#[A-Fa-f0-9]{6}$/)
    .optional(),
};

const updateCategoryObject = z.object(updateCategorySchema);
export type UpdateCategoryDTO = z.infer<typeof updateCategoryObject>;
