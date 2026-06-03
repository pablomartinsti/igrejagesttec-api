import { prisma } from '../src/database/prisma.client';

const demoDate = new Date('2026-06-03T00:00:00.000Z');

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

async function findOrCreateFinancialCategory(
  churchId: string,
  title: string,
  color: string,
) {
  const category = await prisma.category.findFirst({
    where: { churchId, title },
  });

  if (category) return category;

  return prisma.category.create({
    data: { title, color, churchId },
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

async function findOrCreateCulto(churchId: string, categoryId: string) {
  const culto = await prisma.culto.findFirst({
    where: {
      churchId,
      categoryId,
      date: demoDate,
      preacher: 'Pr. Teste',
    },
  });

  if (culto) return culto;

  return prisma.culto.create({
    data: {
      churchId,
      categoryId,
      date: demoDate,
      preacher: 'Pr. Teste',
    },
  });
}

async function createTransactionIfMissing({
  churchId,
  cultoId,
  categoryId,
  title,
  amount,
  type,
}: {
  churchId: string;
  cultoId: string;
  categoryId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}) {
  const transaction = await prisma.transaction.findFirst({
    where: { churchId, cultoId, title },
  });

  if (transaction) return false;

  await prisma.transaction.create({
    data: {
      churchId,
      cultoId,
      categoryId,
      title,
      amount,
      type,
      date: demoDate,
    },
  });

  return true;
}

async function createDizimistaIfMissing(cultoId: string) {
  const dizimista = await prisma.dizimista.findFirst({
    where: { cultoId, name: 'Dizimista Teste' },
  });

  if (dizimista) return false;

  await prisma.dizimista.create({
    data: {
      cultoId,
      name: 'Dizimista Teste',
      contributionType: 'Dizimo',
      amount: 20000,
    },
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

  const cultoCategory = await findOrCreateCultoCategory(
    churchId,
    'Culto de Teste',
  );
  const ofertasCategory = await findOrCreateFinancialCategory(
    churchId,
    'Ofertas Gerais',
    '#22C55E',
  );
  const despesasCategory = await findOrCreateFinancialCategory(
    churchId,
    'Material de Uso e Consumo',
    '#64748B',
  );
  const visitantesCategory = await findOrCreateSpiritualCategory(
    churchId,
    'Visitantes',
  );
  const conversoesCategory = await findOrCreateSpiritualCategory(
    churchId,
    'Conversoes',
  );

  const culto = await findOrCreateCulto(churchId, cultoCategory.id);

  const createdDizimista = await createDizimistaIfMissing(culto.id);
  const createdIncome = await createTransactionIfMissing({
    churchId,
    cultoId: culto.id,
    categoryId: ofertasCategory.id,
    title: 'Oferta teste do culto',
    amount: 15000,
    type: 'income',
  });
  const createdExpense = await createTransactionIfMissing({
    churchId,
    cultoId: culto.id,
    categoryId: despesasCategory.id,
    title: 'Despesa teste do culto',
    amount: 5000,
    type: 'expense',
  });
  const createdVisitantes = await createSpiritualRecordIfMissing({
    cultoId: culto.id,
    categoryId: visitantesCategory.id,
    value: 12,
  });
  const createdConversoes = await createSpiritualRecordIfMissing({
    cultoId: culto.id,
    categoryId: conversoesCategory.id,
    value: 2,
  });

  console.log('Seed de teste concluido.');
  console.table([
    { item: 'Igreja', id: churchId },
    { item: 'Culto', id: culto.id },
    { item: 'Dizimista teste', criado: createdDizimista },
    { item: 'Entrada teste', criado: createdIncome },
    { item: 'Saida teste', criado: createdExpense },
    { item: 'Visitantes teste', criado: createdVisitantes },
    { item: 'Conversoes teste', criado: createdConversoes },
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
