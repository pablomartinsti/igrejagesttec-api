# IgrejaGestTec — Backend

Backend de um sistema de gestão financeira e espiritual para igrejas. Desenvolvido com **Node.js**, **Express**, **TypeScript** e **PostgreSQL** com **Prisma ORM**.

---

## 🚀 Funcionalidades implementadas

### ✅ Fase 1 — Banco de dados

- Modelagem completa para sistema multi-tenant
- Tabelas: `Church`, `User`, `Culto`, `Dizimista`, `SpiritualCategory`, `SpiritualRecord`, `Category`, `Transaction`

### ✅ Fase 2 — Autenticação e usuários

- Registro de igrejas protegido por chave de admin
- Login com JWT
- Controle de acesso por perfil (`ADMIN`, `PASTOR`)
- Isolamento de dados por igreja

### ✅ Fase 3 — Cultos e espiritual

- CRUD completo de cultos (sexta noite, domingo manhã, domingo noite)
- Adição e remoção de dizimistas por culto (com ou sem identificação)
- Categorias espirituais personalizadas por igreja
- Registro e remoção de dados espirituais por culto
- Transações podem ser vinculadas a um culto (opcional)
- Delete em cascata: ao deletar culto, remove dizimistas, registros espirituais e transações vinculadas

### ✅ Fase 4 — Relatórios

- Relatório completo por culto (financeiro + espiritual + dizimistas)
- Relatório por período (semana, mês ou intervalo personalizado)
- Relatório anual com consolidado mês a mês

### ✅ CRUD completo

- Categorias financeiras: criar, listar, editar, deletar
- Transações: criar, listar, editar, deletar
- Cultos: criar, listar, buscar, editar, deletar (com cascata)

---

## 🛠️ Tecnologias

- **Node.js** + **TypeScript**
- **Express** — framework HTTP
- **PostgreSQL** — banco de dados relacional
- **Prisma ORM v7** — acesso ao banco com tipagem
- **Zod** — validação de dados
- **JWT** — autenticação
- **bcryptjs** — hash de senhas
- **Docker** — banco de dados em container

---

## ⚙️ Pré-requisitos

- Node.js 18+
- npm
- Docker Desktop

---

## 🚀 Rodando localmente

**1. Clone o repositório**

```bash
git clone https://github.com/pablomartinsti/igrejagesttec-api.git
cd igrejagesttec-api
```

**2. Instale as dependências**

```bash
npm install
```

**3. Configure o ambiente**

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://devbills:pass123@localhost:5432/finance_db"
JWT_SECRET="sua_chave_jwt_secreta"
ADMIN_KEY="sua_chave_admin_secreta"
FRONT_URL="http://localhost:5173"
```

**4. Suba o banco de dados**

```bash
docker-compose up -d postgres
```

**5. Rode as migrations**

```bash
npx prisma migrate dev
npx prisma generate
```

**6. Inicie o servidor**

```bash
npm run dev
```

Servidor rodando em: `http://localhost:3333`

---

## 🌐 Endpoints

> Todas as rotas exceto `/auth/register` e `/auth/login` requerem o header:
> `Authorization: Bearer seu_token`

---

### Auth

| Método | Rota             | Descrição                    | Autenticação            |
| ------ | ---------------- | ---------------------------- | ----------------------- |
| POST   | `/auth/register` | Registra nova igreja + admin | `X-Admin-Key` no header |
| POST   | `/auth/login`    | Login de usuário             | Pública                 |

**POST /auth/register**

Header:

```
X-Admin-Key: sua_chave_admin_secreta
```

Body:

```json
{
  "church": {
    "name": "IEQ Uberlândia Planalto",
    "cnpj": "62.955.505/3998-25",
    "city": "Uberlândia",
    "state": "MG",
    "phone": "34999999999",
    "email": "ieq.planalto@email.com"
  },
  "user": {
    "name": "Nome do Admin",
    "email": "admin@igreja.com",
    "password": "senha123"
  }
}
```

**POST /auth/login**

```json
{
  "email": "admin@igreja.com",
  "password": "senha123"
}
```

---

### Users

> Apenas perfil `ADMIN`

| Método | Rota     | Descrição                |
| ------ | -------- | ------------------------ |
| POST   | `/users` | Cria usuário na igreja   |
| GET    | `/users` | Lista usuários da igreja |

**POST /users**

```json
{
  "name": "Nome do Usuário",
  "email": "usuario@igreja.com",
  "password": "senha123",
  "role": "PASTOR"
}
```

> Perfis disponíveis: `ADMIN`, `PASTOR`

---

### Categories

| Método | Rota              | Descrição                  |
| ------ | ----------------- | -------------------------- |
| POST   | `/categories`     | Cria categoria financeira  |
| GET    | `/categories`     | Lista categorias da igreja |
| PUT    | `/categories/:id` | Atualiza categoria         |
| DELETE | `/categories/:id` | Deleta categoria           |

**POST /categories**

```json
{
  "title": "Dízimos",
  "color": "#4CAF50"
}
```

**PUT /categories/:id**

```json
{
  "title": "Dízimos Atualizado",
  "color": "#FF5733"
}
```

---

### Transactions

| Método | Rota                                | Descrição                    |
| ------ | ----------------------------------- | ---------------------------- |
| POST   | `/transactions`                     | Cria transação               |
| GET    | `/transactions`                     | Lista transações com filtros |
| PUT    | `/transactions/:id`                 | Atualiza transação           |
| DELETE | `/transactions/:id`                 | Deleta transação             |
| GET    | `/transactions/dashboard`           | Saldo, receitas e despesas   |
| GET    | `/transactions/financial-evolution` | Evolução financeira por ano  |

**POST /transactions**

```json
{
  "title": "Dízimo João Silva",
  "amount": 50000,
  "type": "income",
  "date": "2026-06-01",
  "categoryId": "uuid-da-categoria",
  "cultoId": "uuid-do-culto"
}
```

> `amount` em centavos — R$ 500,00 = `50000` > `cultoId` é opcional — omita para transações avulsas

**PUT /transactions/:id**

```json
{
  "title": "Título atualizado",
  "amount": 60000
}
```

**Filtros disponíveis:**

```
GET /transactions?title=João
GET /transactions?categoryId=uuid
GET /transactions?beginDate=2026-01-01&endDate=2026-12-31
GET /transactions/dashboard?beginDate=2026-01-01&endDate=2026-12-31
GET /transactions/financial-evolution?year=2026
```

---

### Cultos

| Método | Rota                                  | Descrição                     |
| ------ | ------------------------------------- | ----------------------------- |
| POST   | `/cultos/categorias-espirituais`      | Cria categoria espiritual     |
| GET    | `/cultos/categorias-espirituais`      | Lista categorias espirituais  |
| POST   | `/cultos`                             | Cria culto                    |
| GET    | `/cultos`                             | Lista todos os cultos         |
| GET    | `/cultos/:id`                         | Busca culto por id            |
| PUT    | `/cultos/:id`                         | Atualiza culto                |
| DELETE | `/cultos/:id`                         | Deleta culto e tudo vinculado |
| POST   | `/cultos/:id/dizimistas`              | Adiciona dizimista ao culto   |
| DELETE | `/cultos/:id/dizimistas/:dizimistaId` | Remove dizimista              |
| POST   | `/cultos/:id/espiritual`              | Adiciona registro espiritual  |
| DELETE | `/cultos/:id/espiritual/:recordId`    | Remove registro espiritual    |

**POST /cultos/categorias-espirituais**

```json
{
  "title": "Conversões"
}
```

**POST /cultos**

```json
{
  "date": "2026-06-01",
  "type": "SUNDAY_MORNING",
  "preacher": "Pr. Warley de Jesus da Silva"
}
```

> Tipos disponíveis: `FRIDAY_NIGHT`, `SUNDAY_MORNING`, `SUNDAY_NIGHT`

**PUT /cultos/:id**

```json
{
  "preacher": "Pr. Warley Atualizado",
  "type": "SUNDAY_NIGHT"
}
```

**POST /cultos/:id/dizimistas**

```json
{
  "name": "Juliana Santos de Melo",
  "amount": 22600,
  "contributionType": "Dinheiro"
}
```

> `name` é opcional — omita quando não souber o nome do doador

**POST /cultos/:id/espiritual**

```json
{
  "categoryId": "uuid-da-categoria-espiritual",
  "value": 3
}
```

> ⚠️ Ao deletar um culto, todos os dizimistas, registros espirituais e transações vinculadas são deletados automaticamente.

---

### Relatórios

| Método | Rota                         | Descrição                      |
| ------ | ---------------------------- | ------------------------------ |
| GET    | `/relatorios/culto/:cultoId` | Relatório completo de um culto |
| GET    | `/relatorios/periodo`        | Relatório por período          |
| GET    | `/relatorios/anual`          | Relatório anual mês a mês      |

**GET /relatorios/culto/:cultoId**

```
GET /relatorios/culto/uuid-do-culto
```

Retorna: dados do culto, financeiro (dízimos, entradas, saídas, saldo), dizimistas, registros espirituais e transações.

**GET /relatorios/periodo**

```
GET /relatorios/periodo?beginDate=2026-06-01&endDate=2026-06-30
```

Retorna: financeiro consolidado, espiritual consolidado, lista de cultos do período e transações.

**GET /relatorios/anual**

```
GET /relatorios/anual?year=2026
```

Retorna: resumo do ano (entradas, saídas, dízimos, saldo, total de cultos) e dados mês a mês.

---

## 👥 Perfis de acesso

| Perfil   | Quem é                 | Permissões                             |
| -------- | ---------------------- | -------------------------------------- |
| `ADMIN`  | Tesoureiro responsável | Tudo — lança, visualiza, cria usuários |
| `PASTOR` | Pastor/Líder           | Só visualiza relatórios e dashboard    |

---

## 🗄️ Estrutura do projeto

```
src/
  controllers/    — recebe requisições HTTP
  services/       — regras de negócio
  database/
    repositories/ — acesso ao banco via Prisma
    prisma.client.ts
  dtos/           — validação com Zod
  entities/       — classes de domínio
  errors/         — erros personalizados
  factories/      — instâncias singleton
  middleware/     — auth, validação, roles
  routes/         — definição das rotas
prisma/
  schema.prisma   — modelo do banco de dados
```

---

## 📦 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Compilar para produção
npm start        # Produção
```

---

## 📄 Licença

MIT — consulte o arquivo [LICENSE](LICENSE) para detalhes.
