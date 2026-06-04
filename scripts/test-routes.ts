import 'dotenv/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ExpectedStatus = number | number[];

type RequestOptions = {
  token?: string;
  body?: unknown;
  expected?: ExpectedStatus;
  label?: string;
};

type LoginResponse = {
  token?: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
};

type ApiResult<T = unknown> = {
  status: number;
  data: T;
};

const apiUrl = (
  process.env.SMOKE_API_URL ||
  process.env.API_URL ||
  'http://localhost:3333'
).replace(/\/$/, '');

const email = process.env.SMOKE_EMAIL || process.env.TEST_EMAIL || '';
const password = process.env.SMOKE_PASSWORD || process.env.TEST_PASSWORD || '';
const mutate = ['1', 'true', 'yes', 'sim'].includes(
  (process.env.SMOKE_MUTATE || '').toLowerCase(),
);

let passed = 0;

function expectedList(expected: ExpectedStatus) {
  return Array.isArray(expected) ? expected : [expected];
}

function formatData(data: unknown) {
  if (data === null || data === undefined || data === '') return '';
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  return text.length > 500 ? `${text.slice(0, 500)}...` : text;
}

function getId(value: unknown) {
  if (!value || typeof value !== 'object') return '';
  const record = value as { id?: unknown; _id?: unknown };
  if (typeof record.id === 'string') return record.id;
  if (typeof record._id === 'string') return record._id;
  return '';
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function monthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

  return {
    year: String(year),
    beginDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

async function request<T = unknown>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const expected = expectedList(options.expected ?? 200);
  const label = options.label || `${method} ${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!expected.includes(response.status)) {
      throw new Error(
        `${label} retornou ${response.status}. Esperado: ${expected.join(
          ' ou ',
        )}. Resposta: ${formatData(data)}`,
      );
    }

    passed += 1;
    console.log(`OK ${label}`);
    return { status: response.status, data: data as T };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`${label} demorou demais para responder.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function login() {
  if (!email || !password) {
    throw new Error(
      [
        'Informe as credenciais para o teste:',
        'PowerShell:',
        "$env:SMOKE_EMAIL='admin@email.com'",
        "$env:SMOKE_PASSWORD='sua-senha'",
        'npm run test:routes',
      ].join('\n'),
    );
  }

  const result = await request<LoginResponse>('POST', '/auth/login', {
    label: 'login',
    body: { email, password },
  });

  if (!result.data.token) {
    throw new Error('Login nao retornou token.');
  }

  console.log(
    `Logado como ${result.data.user?.name || result.data.user?.email || email} (${
      result.data.user?.role || 'sem role'
    })`,
  );

  return {
    token: result.data.token,
    role: result.data.user?.role || '',
  };
}

async function runReadOnlyChecks(token: string, role: string) {
  const { year, beginDate, endDate } = monthRange();

  await request('GET', '/', { label: 'base da API' });
  await request('GET', '/categories', {
    expected: 401,
    label: 'rota protegida sem token',
  });

  await request('GET', '/church', { token, label: 'dados da igreja' });
  await request('GET', '/categories', { token, label: 'categorias financeiras' });
  await request('GET', '/cultos/categorias', {
    token,
    label: 'categorias de culto',
  });
  await request('GET', '/cultos/categorias-espirituais', {
    token,
    label: 'categorias espirituais',
  });

  const cultos = await request<unknown[]>('GET', '/cultos', {
    token,
    label: 'lista de cultos',
  });

  await request('GET', `/transactions?beginDate=${beginDate}&endDate=${endDate}`, {
    token,
    label: 'lista de transacoes',
  });
  await request(
    'GET',
    `/transactions/dashboard?beginDate=${beginDate}&endDate=${endDate}`,
    { token, label: 'dashboard financeiro' },
  );
  await request('GET', `/transactions/financial-evolution?year=${year}`, {
    token,
    label: 'evolucao financeira',
  });
  await request('GET', `/relatorios/periodo?beginDate=${beginDate}&endDate=${endDate}`, {
    token,
    label: 'relatorio por periodo',
  });
  await request('GET', `/relatorios/anual?year=${year}`, {
    token,
    label: 'relatorio anual',
  });

  const firstCultoId = getId(asArray(cultos.data)[0]);
  if (firstCultoId) {
    await request('GET', `/cultos/${firstCultoId}`, {
      token,
      label: 'detalhe de culto',
    });
    await request('GET', `/relatorios/culto/${firstCultoId}`, {
      token,
      label: 'relatorio por culto',
    });
  } else {
    console.log('SKIP detalhe/relatorio por culto: nenhum culto cadastrado.');
  }

  await request('GET', '/users', {
    token,
    expected: role === 'ADMIN' ? 200 : 403,
    label: 'usuarios conforme permissao',
  });
}

async function runMutationChecks(token: string, role: string) {
  if (role !== 'ADMIN') {
    throw new Error('SMOKE_MUTATE=true precisa ser executado com usuario ADMIN.');
  }

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const today = new Date().toISOString();
  const created = {
    categoryId: '',
    cultoCategoryId: '',
    cultoId: '',
    looseTransactionId: '',
  };

  try {
    const category = await request('POST', '/categories', {
      token,
      expected: 201,
      label: 'criar categoria financeira temporaria',
      body: {
        title: `[SMOKE] Categoria ${stamp}`,
        color: '#2563EB',
      },
    });
    created.categoryId = getId(category.data);

    await request('PUT', `/categories/${created.categoryId}`, {
      token,
      label: 'editar categoria financeira temporaria',
      body: { color: '#16A34A' },
    });

    const cultoCategory = await request('POST', '/cultos/categorias', {
      token,
      expected: 201,
      label: 'criar categoria de culto temporaria',
      body: { title: `[SMOKE] Culto ${stamp}` },
    });
    created.cultoCategoryId = getId(cultoCategory.data);

    const culto = await request('POST', '/cultos', {
      token,
      expected: 201,
      label: 'criar culto temporario',
      body: {
        date: today,
        categoryId: created.cultoCategoryId,
        preacher: 'Teste automatico',
      },
    });
    created.cultoId = getId(culto.data);

    await request('PUT', `/cultos/${created.cultoId}`, {
      token,
      label: 'editar culto temporario',
      body: { preacher: 'Teste automatico atualizado' },
    });

    await request('POST', `/cultos/${created.cultoId}/dizimistas`, {
      token,
      expected: 201,
      label: 'criar dizimo/oferta no culto',
      body: {
        name: 'Teste automatico',
        amount: 1000,
        contributionType: 'Oferta',
      },
    });

    const spiritualCategories = await request<unknown[]>(
      'GET',
      '/cultos/categorias-espirituais',
      { token, label: 'buscar categoria espiritual para teste' },
    );
    const spiritualCategoryId = getId(asArray(spiritualCategories.data)[0]);

    if (spiritualCategoryId) {
      await request('POST', `/cultos/${created.cultoId}/espiritual`, {
        token,
        expected: 201,
        label: 'criar registro espiritual no culto',
        body: {
          categoryId: spiritualCategoryId,
          value: 1,
        },
      });
    } else {
      console.log(
        'SKIP registro espiritual: nao existe categoria espiritual para reutilizar.',
      );
    }

    const looseTransaction = await request('POST', '/transactions', {
      token,
      expected: 201,
      label: 'criar transacao avulsa temporaria',
      body: {
        title: `[SMOKE] Transacao ${stamp}`,
        amount: 2500,
        type: 'expense',
        date: today,
        categoryId: created.categoryId,
      },
    });
    created.looseTransactionId = getId(looseTransaction.data);

    await request('PUT', `/transactions/${created.looseTransactionId}`, {
      token,
      label: 'editar transacao avulsa temporaria',
      body: { amount: 2600 },
    });

    await request('POST', '/transactions', {
      token,
      expected: 201,
      label: 'criar transacao vinculada ao culto',
      body: {
        title: `[SMOKE] Entrada culto ${stamp}`,
        amount: 3000,
        type: 'income',
        date: today,
        categoryId: created.categoryId,
        cultoId: created.cultoId,
      },
    });
  } finally {
    if (created.looseTransactionId) {
      await request('DELETE', `/transactions/${created.looseTransactionId}`, {
        token,
        expected: 204,
        label: 'limpar transacao avulsa temporaria',
      });
    }
    if (created.cultoId) {
      await request('DELETE', `/cultos/${created.cultoId}`, {
        token,
        expected: 204,
        label: 'limpar culto temporario',
      });
    }
    if (created.cultoCategoryId) {
      await request('DELETE', `/cultos/categorias/${created.cultoCategoryId}`, {
        token,
        expected: 204,
        label: 'limpar categoria de culto temporaria',
      });
    }
    if (created.categoryId) {
      await request('DELETE', `/categories/${created.categoryId}`, {
        token,
        expected: 204,
        label: 'limpar categoria financeira temporaria',
      });
    }
  }
}

async function main() {
  console.log(`API: ${apiUrl}`);
  console.log(`Modo completo com escrita: ${mutate ? 'sim' : 'nao'}`);

  try {
    const { token, role } = await login();
    await runReadOnlyChecks(token, role);

    if (mutate) {
      await runMutationChecks(token, role);
    }

    console.log(`\nTudo certo. Checks aprovados: ${passed}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\nFalhou: ${message}`);
    console.error(
      `Confira se a API esta rodando em ${apiUrl} e se as credenciais estao corretas.`,
    );
    process.exitCode = 1;
  }
}

main();
