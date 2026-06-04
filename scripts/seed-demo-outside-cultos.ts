import { prisma } from '../src/database/prisma.client';

type CategorySeed = {
  title: string;
  color: string;
};

type ExpenseSeed = {
  title: string;
  category: string;
  amount: number;
  day: number;
};

const categories: CategorySeed[] = [
  { title: 'Agua e Esgoto', color: '#0EA5E9' },
  { title: 'Internet e Telefone', color: '#6366F1' },
  { title: 'Energia Eletrica', color: '#EAB308' },
  { title: 'Sustento Pastoral do Titular', color: '#0F766E' },
  { title: 'Material de Uso e Consumo', color: '#64748B' },
  { title: 'Manutencao Predial', color: '#78716C' },
  { title: 'Despesas Administrativas', color: '#BE123C' },
];

const monthlyExpenses: ExpenseSeed[] = [
  {
    title: 'Conta de agua',
    category: 'Agua e Esgoto',
    amount: 18500,
    day: 5,
  },
  {
    title: 'Conta de luz',
    category: 'Energia Eletrica',
    amount: 46000,
    day: 7,
  },
  {
    title: 'Internet da igreja',
    category: 'Internet e Telefone',
    amount: 15990,
    day: 10,
  },
  {
    title: 'Sustento pastoral',
    category: 'Sustento Pastoral do Titular',
    amount: 250000,
    day: 15,
  },
  {
    title: 'Material de limpeza e consumo',
    category: 'Material de Uso e Consumo',
    amount: 28500,
    day: 20,
  },
  {
    title: 'Despesas administrativas',
    category: 'Despesas Administrativas',
    amount: 12000,
    day: 25,
  },
];

const occasionalExpenses: Array<ExpenseSeed & { months: number[] }> = [
  {
    title: 'Manutencao eletrica',
    category: 'Manutencao Predial',
    amount: 35000,
    day: 12,
    months: [0, 2, 4],
  },
  {
    title: 'Compra para despensa',
    category: 'Material de Uso e Consumo',
    amount: 42000,
    day: 22,
    months: [1, 3, 5],
  },
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

async function findOrCreateCategory(churchId: string, seed: CategorySeed) {
  const category = await prisma.category.findFirst({
    where: { churchId, title: seed.title },
  });

  if (category) return category;

  return prisma.category.create({
    data: { ...seed, churchId },
  });
}

function createDate(month: number, day: number) {
  return new Date(Date.UTC(2026, month, day));
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function createExpenseIfMissing({
  churchId,
  categoryId,
  title,
  amount,
  date,
}: {
  churchId: string;
  categoryId: string;
  title: string;
  amount: number;
  date: Date;
}) {
  const exists = await prisma.transaction.findFirst({
    where: {
      churchId,
      title,
      date,
      type: 'expense',
      cultoId: null,
    },
  });

  if (exists) return false;

  await prisma.transaction.create({
    data: {
      churchId,
      categoryId,
      title,
      amount,
      type: 'expense',
      date,
    },
  });

  return true;
}

async function main() {
  const churchId = await resolveChurchId();
  const categoriesByTitle = new Map<string, { id: string }>();

  for (const seed of categories) {
    categoriesByTitle.set(seed.title, await findOrCreateCategory(churchId, seed));
  }

  let expensesCreated = 0;

  for (let month = 0; month <= 5; month++) {
    for (const expense of monthlyExpenses) {
      const date = createDate(month, expense.day);
      const dateKey = formatDateKey(date);
      const categoryId = categoriesByTitle.get(expense.category)?.id;

      if (!categoryId) continue;

      const created = await createExpenseIfMissing({
        churchId,
        categoryId,
        title: `${expense.title} ${dateKey}`,
        amount: expense.amount + month * 1200,
        date,
      });

      if (created) expensesCreated++;
    }

    for (const expense of occasionalExpenses) {
      if (!expense.months.includes(month)) continue;

      const date = createDate(month, expense.day);
      const dateKey = formatDateKey(date);
      const categoryId = categoriesByTitle.get(expense.category)?.id;

      if (!categoryId) continue;

      const created = await createExpenseIfMissing({
        churchId,
        categoryId,
        title: `${expense.title} ${dateKey}`,
        amount: expense.amount + month * 1500,
        date,
      });

      if (created) expensesCreated++;
    }
  }

  console.log('Seed de despesas fora do culto concluido.');
  console.table([
    { item: 'Igreja', id: churchId },
    { item: 'Despesas soltas criadas', total: expensesCreated },
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
