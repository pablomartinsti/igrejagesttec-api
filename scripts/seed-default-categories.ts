import { prisma } from '../src/database/prisma.client';

type FinancialCategorySeed = {
  title: string;
  color: string;
};

const financialCategories: FinancialCategorySeed[] = [
  { title: 'Dizimos', color: '#10B981' },
  { title: 'Ofertas Gerais', color: '#22C55E' },
  { title: 'Ofertas Especiais', color: '#14B8A6' },
  { title: 'Outras Ofertas', color: '#84CC16' },
  { title: 'Oferta de Missoes', color: '#3B82F6' },
  { title: 'Oferta Missoes 3 Domingo', color: '#2563EB' },
  { title: 'Celulas', color: '#8B5CF6' },
  { title: 'Congregacoes', color: '#6366F1' },
  { title: 'Outras Entradas', color: '#06B6D4' },
  { title: 'Taxa 4 CND', color: '#EF4444' },
  { title: 'Taxa 1 Fundo Social', color: '#F97316' },
  { title: '50 Missoes Nacionais', color: '#F59E0B' },
  { title: 'Taxa 4 CED Supervisao', color: '#DC2626' },
  { title: '50 Missoes Estaduais', color: '#D97706' },
  { title: 'Taxa 4 Regiao', color: '#B91C1C' },
  { title: 'Taxa 3 Construcao CED', color: '#92400E' },
  { title: 'Energia Eletrica', color: '#EAB308' },
  { title: 'Outras Contribuicoes', color: '#A855F7' },
  { title: 'Material de Uso e Consumo', color: '#64748B' },
  { title: 'Sustento Pastoral do Titular', color: '#0F766E' },
  { title: 'Sustento Pastoral de Auxiliar', color: '#0E7490' },
  { title: 'Despesas com Material para Reforma', color: '#78716C' },
  { title: 'Despesas Cartorarias', color: '#BE123C' },
];

const cultoCategories = [
  'Culto de Domingo',
  'Culto de Fe',
  'Culto de Jovens',
  'Santa Ceia',
  'Conferencia',
  'Vigilia',
  'Culto de Missoes',
  'Culto de Mulheres',
  'Culto de Homens',
  'Escola Biblica',
  'Evento Especial',
];

const spiritualCategories = [
  'Testemunhos de cura',
  'Batizados no Espirito Santo',
  'Criancas apresentadas',
  'Conversoes',
  'Visitantes',
  'Total de presentes',
  'Visitas especiais',
];

async function resolveChurchId() {
  const churchId = process.env.CHURCH_ID;

  if (churchId) {
    const church = await prisma.church.findUnique({ where: { id: churchId } });

    if (!church) {
      throw new Error(`Igreja nao encontrada para CHURCH_ID=${churchId}`);
    }

    return church.id;
  }

  const churches = await prisma.church.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  if (churches.length === 0) {
    throw new Error('Nenhuma igreja cadastrada. Crie a igreja/admin primeiro.');
  }

  if (churches.length > 1) {
    console.table(churches);
    throw new Error(
      'Existe mais de uma igreja. Rode novamente informando CHURCH_ID.',
    );
  }

  return churches[0].id;
}

async function seedFinancialCategories(churchId: string) {
  let created = 0;
  let skipped = 0;

  for (const category of financialCategories) {
    const exists = await prisma.category.findFirst({
      where: { churchId, title: category.title },
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

async function seedCultoCategories(churchId: string) {
  let created = 0;
  let skipped = 0;

  for (const title of cultoCategories) {
    const exists = await prisma.cultoCategory.findFirst({
      where: { churchId, title },
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

async function seedSpiritualCategories(churchId: string) {
  let created = 0;
  let skipped = 0;

  for (const title of spiritualCategories) {
    const exists = await prisma.spiritualCategory.findFirst({
      where: { churchId, title },
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

async function main() {
  const churchId = await resolveChurchId();

  const [financial, culto, spiritual] = await Promise.all([
    seedFinancialCategories(churchId),
    seedCultoCategories(churchId),
    seedSpiritualCategories(churchId),
  ]);

  console.log('Seed concluido para igreja:', churchId);
  console.table([
    { grupo: 'Categorias financeiras', ...financial },
    { grupo: 'Categorias de culto', ...culto },
    { grupo: 'Categorias espirituais', ...spiritual },
  ]);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
