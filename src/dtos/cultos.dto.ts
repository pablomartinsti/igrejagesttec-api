import { z } from 'zod';

export const createCultoSchema = {
  date: z.coerce.date(),
  categoryId: z.string().uuid(),
  preacher: z.string().optional(),
};

const createCultoObject = z.object(createCultoSchema);
export type CreateCultoDTO = z.infer<typeof createCultoObject>;

export const updateCultoSchema = {
  date: z.coerce.date().optional(),
  categoryId: z.string().uuid().optional(),
  preacher: z.string().optional(),
};

const updateCultoObject = z.object(updateCultoSchema);
export type UpdateCultoDTO = z.infer<typeof updateCultoObject>;

export const createDizimistaSchema = {
  name: z.string().optional(),
  amount: z.number().int().positive(),
  contributionType: z.string().optional(),
};

const createDizimistaObject = z.object(createDizimistaSchema);
export type CreateDizimistaDTO = z.infer<typeof createDizimistaObject>;

export const createSpiritualRecordSchema = {
  categoryId: z.string().uuid(),
  value: z.number().int().positive(),
};

const createSpiritualRecordObject = z.object(createSpiritualRecordSchema);
export type CreateSpiritualRecordDTO = z.infer<
  typeof createSpiritualRecordObject
>;

export const createSpiritualCategorySchema = {
  title: z.string().min(1),
};

const createSpiritualCategoryObject = z.object(createSpiritualCategorySchema);
export type CreateSpiritualCategoryDTO = z.infer<
  typeof createSpiritualCategoryObject
>;

export const createCultoCategorySchema = {
  title: z.string().min(1),
};

const createCultoCategoryObject = z.object(createCultoCategorySchema);
export type CreateCultoCategoryDTO = z.infer<typeof createCultoCategoryObject>;
