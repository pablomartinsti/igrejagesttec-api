import { prisma } from '../database/prisma.client';
import {
  RelatorioCultoDTO,
  RelatorioPeriodoDTO,
  RelatorioAnualDTO,
} from '../dtos/relatorios.dto';
import { StatusCodes } from 'http-status-codes';
import { ApppError } from '../errors/app.error';

export class RelatoriosService {
  async porCulto({ cultoId }: RelatorioCultoDTO, churchId: string) {
    const culto = await prisma.culto.findFirst({
      where: { id: cultoId, churchId },
      include: {
        dizimistas: true,
        spiritualRecords: { include: { category: true } },
        transactions: { include: { category: true } },
      },
    });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    const totalDizimos = culto.dizimistas.reduce((acc, d) => acc + d.amount, 0);
    const totalEntradas = culto.transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalSaidas = culto.transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      culto: {
        id: culto.id,
        date: culto.date,
        type: culto.type,
        preacher: culto.preacher,
      },
      financeiro: {
        totalDizimos,
        totalEntradas,
        totalSaidas,
        saldo: totalEntradas - totalSaidas,
      },
      dizimistas: culto.dizimistas,
      espiritual: culto.spiritualRecords,
      transacoes: culto.transactions,
    };
  }

  async porPeriodo(
    { beginDate, endDate }: RelatorioPeriodoDTO,
    churchId: string,
  ) {
    const cultos = await prisma.culto.findMany({
      where: {
        churchId,
        date: { gte: beginDate, lte: endDate },
      },
      include: {
        dizimistas: true,
        spiritualRecords: { include: { category: true } },
        transactions: { include: { category: true } },
      },
      orderBy: { date: 'asc' },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        churchId,
        date: { gte: beginDate, lte: endDate },
      },
      include: { category: true },
    });

    const totalEntradas = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalSaidas = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalDizimos = cultos
      .flatMap((c) => c.dizimistas)
      .reduce((acc, d) => acc + d.amount, 0);

    const espiritual: Record<string, number> = {};
    cultos
      .flatMap((c) => c.spiritualRecords)
      .forEach((r) => {
        const title = r.category.title;
        espiritual[title] = (espiritual[title] || 0) + r.value;
      });

    return {
      periodo: { beginDate, endDate },
      financeiro: {
        totalEntradas,
        totalSaidas,
        totalDizimos,
        saldo: totalEntradas - totalSaidas,
      },
      espiritual,
      cultos: cultos.map((c) => ({
        id: c.id,
        date: c.date,
        type: c.type,
        preacher: c.preacher,
        dizimistas: c.dizimistas.length,
        transacoes: c.transactions.length,
      })),
      transacoes: transactions,
    };
  }

  async anual({ year }: RelatorioAnualDTO, churchId: string) {
    const beginDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const transactions = await prisma.transaction.findMany({
      where: {
        churchId,
        date: { gte: beginDate, lte: endDate },
      },
      include: { category: true },
    });

    const cultos = await prisma.culto.findMany({
      where: {
        churchId,
        date: { gte: beginDate, lte: endDate },
      },
      include: {
        dizimistas: true,
        spiritualRecords: { include: { category: true } },
      },
    });

    // agrupa por mês
    const meses: Record<
      number,
      {
        entradas: number;
        saidas: number;
        dizimos: number;
        cultos: number;
        espiritual: Record<string, number>;
      }
    > = {};

    for (let i = 1; i <= 12; i++) {
      meses[i] = {
        entradas: 0,
        saidas: 0,
        dizimos: 0,
        cultos: 0,
        espiritual: {},
      };
    }

    transactions.forEach((t) => {
      const mes = new Date(t.date).getMonth() + 1;
      if (t.type === 'income') meses[mes].entradas += t.amount;
      else meses[mes].saidas += t.amount;
    });

    cultos.forEach((c) => {
      const mes = new Date(c.date).getMonth() + 1;
      meses[mes].cultos += 1;
      meses[mes].dizimos += c.dizimistas.reduce((acc, d) => acc + d.amount, 0);
      c.spiritualRecords.forEach((r) => {
        const title = r.category.title;
        meses[mes].espiritual[title] =
          (meses[mes].espiritual[title] || 0) + r.value;
      });
    });

    const totalEntradas = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalSaidas = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalDizimos = cultos
      .flatMap((c) => c.dizimistas)
      .reduce((acc, d) => acc + d.amount, 0);

    return {
      year,
      resumo: {
        totalEntradas,
        totalSaidas,
        totalDizimos,
        saldo: totalEntradas - totalSaidas,
        totalCultos: cultos.length,
      },
      meses,
    };
  }
}
