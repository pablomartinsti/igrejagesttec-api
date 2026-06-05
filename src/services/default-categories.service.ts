import { prisma } from '../database/prisma.client';

type FinancialCategorySeed = {
  title: string;
  color: string;
};

type SeedGroupResult = {
  created: number;
  skipped: number;
};

export type DefaultCategoriesSeedResult = {
  financial: SeedGroupResult;
  culto: SeedGroupResult;
  spiritual: SeedGroupResult;
};

export const defaultFinancialCategories: FinancialCategorySeed[] = [
  { title: 'Dizimos', color: '#10B981' },
  { title: 'Ofertas', color: '#22C55E' },
  { title: 'Ofertas Missionarias', color: '#3B82F6' },
  { title: 'Campanhas e Propositos', color: '#14B8A6' },
  { title: 'Doacoes', color: '#8B5CF6' },
  { title: 'Eventos', color: '#F59E0B' },
  { title: 'Cantina e Vendas', color: '#EC4899' },
  { title: 'Alugueis e Uso do Espaco', color: '#06B6D4' },
  { title: 'Outras Receitas', color: '#84CC16' },
  { title: 'Agua e Esgoto', color: '#0EA5E9' },
  { title: 'Energia Eletrica', color: '#EAB308' },
  { title: 'Internet e Telefone', color: '#6366F1' },
  { title: 'Aluguel e Financiamento', color: '#A855F7' },
  { title: 'Sustento Pastoral', color: '#0F766E' },
  { title: 'Ajuda de Custo e Salarios', color: '#0E7490' },
  { title: 'Contabilidade', color: '#64748B' },
  { title: 'Taxas Bancarias', color: '#F97316' },
  { title: 'Impostos e Documentacao', color: '#BE123C' },
  { title: 'Material de Uso e Consumo', color: '#78716C' },
  { title: 'Limpeza e Higiene', color: '#22C55E' },
  { title: 'Manutencao Predial', color: '#92400E' },
  { title: 'Reformas e Construcoes', color: '#B45309' },
  { title: 'Equipamentos e Patrimonio', color: '#475569' },
  { title: 'Som, Midia e Tecnologia', color: '#2563EB' },
  { title: 'Santa Ceia', color: '#7C3AED' },
  { title: 'Ministerio Infantil e EBD', color: '#F472B6' },
  { title: 'Louvor e Musica', color: '#DB2777' },
  { title: 'Evangelismo', color: '#16A34A' },
  { title: 'Missoes', color: '#1D4ED8' },
  { title: 'Acao Social', color: '#059669' },
  { title: 'Eventos e Conferencias', color: '#D97706' },
  { title: 'Transporte e Combustivel', color: '#DC2626' },
  { title: 'Hospedagem e Alimentacao', color: '#EA580C' },
  { title: 'Outras Despesas', color: '#6B7280' },
];

export const defaultCultoCategories = [
  'Culto de Domingo',
  'Culto de Fe',
  'Culto de Ensino',
  'Escola Biblica',
  'Santa Ceia',
  'Culto de Jovens',
  'Culto de Mulheres',
  'Culto de Homens',
  'Culto Infantil',
  'Vigilia',
  'Culto de Missoes',
  'Conferencia',
  'Evento Especial',
];

export const defaultSpiritualCategories = [
  'Visitantes',
  'Conversoes',
  'Reconciliacoes',
  'Batismos nas Aguas',
  'Batizados no Espirito Santo',
  'Criancas Apresentadas',
  'Testemunhos',
  'Pedidos de Oracao',
  'Total de Presentes',
];

async function seedFinancialCategories(
  churchId: string,
): Promise<SeedGroupResult> {
  let created = 0;
  let skipped = 0;

  for (const category of defaultFinancialCategories) {
    const exists = await prisma.category.findUnique({
      where: { title_churchId: { title: category.title, churchId } },
    });

    if (exists) {
      skipped++;
      continue;
    }

    await prisma.category.create({
      data: { ...category, churchId },
    });
    created++;
  }

  return { created, skipped };
}

async function seedCultoCategories(churchId: string): Promise<SeedGroupResult> {
  let created = 0;
  let skipped = 0;

  for (const title of defaultCultoCategories) {
    const exists = await prisma.cultoCategory.findUnique({
      where: { title_churchId: { title, churchId } },
    });

    if (exists) {
      skipped++;
      continue;
    }

    await prisma.cultoCategory.create({
      data: { title, churchId },
    });
    created++;
  }

  return { created, skipped };
}

async function seedSpiritualCategories(
  churchId: string,
): Promise<SeedGroupResult> {
  let created = 0;
  let skipped = 0;

  for (const title of defaultSpiritualCategories) {
    const exists = await prisma.spiritualCategory.findUnique({
      where: { title_churchId: { title, churchId } },
    });

    if (exists) {
      skipped++;
      continue;
    }

    await prisma.spiritualCategory.create({
      data: { title, churchId },
    });
    created++;
  }

  return { created, skipped };
}

export async function createDefaultCategoriesForChurch(
  churchId: string,
): Promise<DefaultCategoriesSeedResult> {
  const [financial, culto, spiritual] = await Promise.all([
    seedFinancialCategories(churchId),
    seedCultoCategories(churchId),
    seedSpiritualCategories(churchId),
  ]);

  return { financial, culto, spiritual };
}
