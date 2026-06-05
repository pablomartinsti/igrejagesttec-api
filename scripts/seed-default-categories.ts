import { prisma } from '../src/database/prisma.client';
import { createDefaultCategoriesForChurch } from '../src/services/default-categories.service';

async function resolveChurches() {
  const churchId = process.env.CHURCH_ID;

  if (churchId) {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { id: true, name: true },
    });

    if (!church) {
      throw new Error(`Igreja nao encontrada para CHURCH_ID=${churchId}`);
    }

    return [church];
  }

  const churches = await prisma.church.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  if (churches.length === 0) {
    throw new Error('Nenhuma igreja cadastrada. Crie a igreja/admin primeiro.');
  }

  return churches;
}

async function main() {
  const churches = await resolveChurches();
  const rows = [];

  for (const church of churches) {
    const result = await createDefaultCategoriesForChurch(church.id);

    rows.push(
      {
        igreja: church.name,
        grupo: 'Financeiras',
        criadas: result.financial.created,
        ignoradas: result.financial.skipped,
      },
      {
        igreja: church.name,
        grupo: 'Cultos',
        criadas: result.culto.created,
        ignoradas: result.culto.skipped,
      },
      {
        igreja: church.name,
        grupo: 'Espirituais',
        criadas: result.spiritual.created,
        ignoradas: result.spiritual.skipped,
      },
    );
  }

  console.log('Seed de categorias padrao concluido.');
  console.table(rows);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
