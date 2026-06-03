import { prisma } from '../src/database/prisma.client';

type FinancialCategorySeed = {
  title: string;
  color: string;
};

const financialCategories: FinancialCategorySeed[] = [
  { title: 'Ofertas Gerais', color: '#22C55E' },
  { title: 'Ofertas Especiais', color: '#14B8A6' },
  { title: 'Oferta de Missoes', color: '#3B82F6' },
  { title: 'Material de Uso e Consumo', color: '#64748B' },
  { title: 'Energia Eletrica', color: '#EAB308' },
  { title: 'Sustento Pastoral do Titular', color: '#0F766E' },
  { title: 'Outras Contribuicoes', color: '#A855F7' },
];

const spiritualCategories = [
  'Visitantes',
  'Conversoes',
  'Total de presentes',
  'Testemunhos de cura',
  'Criancas apresentadas',
];

const dizimistaNames = [
  'Ana Amelia',
  'Juliana Santos',
  'Patricia Silva',
  'Jose Mauro',
  'Daniel Sousa',
  'Odovania Carvalho',
];

const sundayPreachers = [
  'Pr. Warley de Jesus',
  'Pra. Zuleide Cristiana',
  'Pra. Sonia Martins',
];

const tuesdayPreachers = [
  'Pr. Warley de Jesus',
  'Pb. Carlos Alberto',
  'Pra. Zuleide Cristiana',
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

function getDemoDates() {
  const dates: { date: Date; kind: 'sunday' | 'tuesday' }[] = [];

  for (let month = 0; month <= 4; month++) {
    const cursor = new Date(Date.UTC(2026, month, 1));

    while (cursor.getUTCMonth() === month) {
      const day = cursor.getUTCDay();

      if (day === 0) {
        dates.push({
          date: new Date(cursor),
          kind: 'sunday',
        });
      }

      if (day === 2) {
        dates.push({
          date: new Date(cursor),
          kind: 'tuesday',
        });
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return dates;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function findOrCreateFinancialCategory(
  churchId: string,
  seed: FinancialCategorySeed,
) {
  const category = await prisma.category.findFirst({
    where: { churchId, title: seed.title },
  });

  if (category) return category;

  return prisma.category.create({
    data: { ...seed, churchId },
  });
}

async function findOrCreateCultoCategory(churchId: string, title: string) {
  const category = await prisma.cultoCategory.findFirst({
    where: { churchId, title },
  });

  if (category) return category;

  return prisma.cultoCategory.create({
    data: { title, churchId },
  });
}

async function findOrCreateSpiritualCategory(churchId: string, title: string) {
  const category = await prisma.spiritualCategory.findFirst({
    where: { churchId, title },
  });

  if (category) return category;

  return prisma.spiritualCategory.create({
    data: { title, churchId },
  });
}

async function findOrCreateCulto({
  churchId,
  categoryId,
  date,
  preacher,
}: {
  churchId: string;
  categoryId: string;
  date: Date;
  preacher: string;
}) {
  const culto = await prisma.culto.findFirst({
    where: { churchId, categoryId, date },
  });

  if (culto) return { culto, created: false };

  const created = await prisma.culto.create({
    data: { churchId, categoryId, date, preacher },
  });

  return { culto: created, created: true };
}

async function createTransactionIfMissing({
  churchId,
  cultoId,
  categoryId,
  title,
  amount,
  type,
  date,
}: {
  churchId: string;
  cultoId: string;
  categoryId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}) {
  const transaction = await prisma.transaction.findFirst({
    where: { churchId, cultoId, title },
  });

  if (transaction) return false;

  await prisma.transaction.create({
    data: { churchId, cultoId, categoryId, title, amount, type, date },
  });

  return true;
}

async function createDizimistaIfMissing({
  cultoId,
  name,
  amount,
}: {
  cultoId: string;
  name: string;
  amount: number;
}) {
  const dizimista = await prisma.dizimista.findFirst({
    where: { cultoId, name },
  });

  if (dizimista) return false;

  await prisma.dizimista.create({
    data: { cultoId, name, contributionType: 'Dizimo', amount },
  });

  return true;
}

async function createSpiritualRecordIfMissing({
  cultoId,
  categoryId,
  value,
}: {
  cultoId: string;
  categoryId: string;
  value: number;
}) {
  const record = await prisma.spiritualRecord.findFirst({
    where: { cultoId, categoryId },
  });

  if (record) return false;

  await prisma.spiritualRecord.create({
    data: { cultoId, categoryId, value },
  });

  return true;
}

async function main() {
  const churchId = await resolveChurchId();

  const categories = new Map<string, { id: string }>();
  for (const seed of financialCategories) {
    categories.set(seed.title, await findOrCreateFinancialCategory(churchId, seed));
  }

  const spiritual = new Map<string, { id: string }>();
  for (const title of spiritualCategories) {
    spiritual.set(title, await findOrCreateSpiritualCategory(churchId, title));
  }

  const sundayCategory = await findOrCreateCultoCategory(
    churchId,
    'Culto de Domingo',
  );
  const tuesdayCategory = await findOrCreateCultoCategory(
    churchId,
    'Culto de Fe',
  );

  let cultosCreated = 0;
  let transactionsCreated = 0;
  let dizimistasCreated = 0;
  let spiritualRecordsCreated = 0;

  for (const [index, item] of getDemoDates().entries()) {
    const isSunday = item.kind === 'sunday';
    const category = isSunday ? sundayCategory : tuesdayCategory;
    const preacher = isSunday
      ? sundayPreachers[index % sundayPreachers.length]
      : tuesdayPreachers[index % tuesdayPreachers.length];

    const { culto, created } = await findOrCreateCulto({
      churchId,
      categoryId: category.id,
      date: item.date,
      preacher,
    });

    if (created) cultosCreated++;

    const dateKey = formatDateKey(item.date);
    const monthFactor = item.date.getUTCMonth() + 1;
    const dayFactor = item.date.getUTCDate();
    const base = isSunday ? 32000 : 16000;

    const offerings = base + monthFactor * 1200 + dayFactor * 110;
    const specialOfferings = isSunday ? 9000 + monthFactor * 800 : 2500;
    const missionOfferings = isSunday && dayFactor <= 21 ? 6000 : 0;
    const expense = isSunday
      ? 7000 + monthFactor * 650
      : 2500 + monthFactor * 300;

    const transactions = [
      {
        title: `Ofertas gerais ${dateKey}`,
        category: 'Ofertas Gerais',
        amount: offerings,
        type: 'income' as const,
      },
      {
        title: `Ofertas especiais ${dateKey}`,
        category: 'Ofertas Especiais',
        amount: specialOfferings,
        type: 'income' as const,
      },
      {
        title: `Despesa operacional ${dateKey}`,
        category: isSunday ? 'Material de Uso e Consumo' : 'Outras Contribuicoes',
        amount: expense,
        type: 'expense' as const,
      },
    ];

    if (missionOfferings > 0) {
      transactions.push({
        title: `Oferta de missoes ${dateKey}`,
        category: 'Oferta de Missoes',
        amount: missionOfferings,
        type: 'income',
      });
    }

    for (const transaction of transactions) {
      const categoryId = categories.get(transaction.category)?.id;
      if (!categoryId) continue;

      const createdTransaction = await createTransactionIfMissing({
        churchId,
        cultoId: culto.id,
        categoryId,
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        date: item.date,
      });

      if (createdTransaction) transactionsCreated++;
    }

    const dizimistaCount = isSunday ? 4 : 2;
    for (let i = 0; i < dizimistaCount; i++) {
      const createdDizimista = await createDizimistaIfMissing({
        cultoId: culto.id,
        name: `${dizimistaNames[(index + i) % dizimistaNames.length]} ${dateKey}`,
        amount: (isSunday ? 9000 : 4500) + i * 2500 + monthFactor * 500,
      });

      if (createdDizimista) dizimistasCreated++;
    }

    const spiritualValues = [
      ['Visitantes', isSunday ? 8 + (index % 6) : 3 + (index % 4)],
      ['Conversoes', isSunday ? index % 3 : index % 2],
      ['Total de presentes', isSunday ? 75 + index * 2 : 32 + index],
      ['Testemunhos de cura', index % 2],
      ['Criancas apresentadas', isSunday ? index % 2 : 0],
    ] as const;

    for (const [title, value] of spiritualValues) {
      const categoryId = spiritual.get(title)?.id;
      if (!categoryId) continue;

      const createdRecord = await createSpiritualRecordIfMissing({
        cultoId: culto.id,
        categoryId,
        value,
      });

      if (createdRecord) spiritualRecordsCreated++;
    }
  }

  console.log('Seed de cultos de janeiro a maio concluido.');
  console.table([
    { item: 'Igreja', id: churchId },
    { item: 'Cultos criados', total: cultosCreated },
    { item: 'Transacoes criadas', total: transactionsCreated },
    { item: 'Dizimistas criados', total: dizimistasCreated },
    { item: 'Registros espirituais criados', total: spiritualRecordsCreated },
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
