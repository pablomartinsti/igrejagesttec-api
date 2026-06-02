import { z } from 'zod';

export const relatorioCultoSchema = {
  cultoId: z.string().uuid(),
};

const relatorioCultoObject = z.object(relatorioCultoSchema);
export type RelatorioCultoDTO = z.infer<typeof relatorioCultoObject>;

export const relatorioPeriodoSchema = {
  beginDate: z.coerce.date(),
  endDate: z.coerce.date(),
};

const relatorioPeriodoObject = z.object(relatorioPeriodoSchema);
export type RelatorioPeriodoDTO = z.infer<typeof relatorioPeriodoObject>;

export const relatorioAnualSchema = {
  year: z.string().regex(/^\d{4}$/, { message: 'Ano inválido' }),
};

const relatorioAnualObject = z.object(relatorioAnualSchema);
export type RelatorioAnualDTO = z.infer<typeof relatorioAnualObject>;
