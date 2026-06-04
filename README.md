# IgrejaGestTec API

Backend do IgrejaGestTec, um sistema de gestao financeira e espiritual para igrejas.

A API foi criada com Node.js, Express, TypeScript, PostgreSQL e Prisma. O sistema trabalha por igreja, mantendo os dados isolados por `churchId` e controlando acesso por perfil de usuario.

## Estado Atual

O backend ja possui:

- Registro de igreja com usuario administrador.
- Login com JWT.
- Usuarios por igreja com perfis `ADMIN`, `TREASURER` e `PASTOR`.
- Configuracao dos dados da igreja.
- Categorias financeiras.
- Categorias de culto.
- Cultos com data, categoria e pregador.
- Dizimos/ofertas vinculados ao culto.
- Categorias e registros espirituais.
- Transacoes avulsas e transacoes vinculadas ao culto.
- Painel financeiro com saldo do periodo, saldo em caixa e gastos por categoria.
- Evolucao financeira anual.
- Relatorios por culto, periodo e ano.
- Script automatico para testar as rotas principais.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- bcryptjs
- Docker Compose

## Requisitos

- Node.js 18+
- npm
- Docker Desktop ou PostgreSQL local

## Configuracao Local

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `.env` na raiz da API:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/igrejagesttec"
JWT_SECRET="sua_chave_jwt"
ADMIN_KEY="sua_chave_para_registro_inicial"
FRONT_URL="http://localhost:5173"
PORT=3333
```

Suba o banco, se estiver usando Docker:

```bash
docker-compose up -d
```

Rode as migrations e gere o Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

Inicie a API:

```bash
npm run dev
```

URL padrao:

```txt
http://localhost:3333
```

## Scripts

```bash
npm run dev              # inicia a API em modo desenvolvimento
npm run build            # compila TypeScript
npm start                # inicia a API compilada
npm run seed:defaults    # cria categorias padrao
npm run seed:demo        # cria dados demonstrativos basicos
npm run seed:demo-months # cria dados de demonstracao por meses
npm run seed:demo-outside # cria despesas avulsas fora dos cultos
npm run test:routes      # testa rotas principais da API
```

## Teste Automatico de Rotas

O script `test:routes` faz um teste rapido das rotas principais. Por padrao ele apenas consulta dados, sem criar, editar ou excluir registros.

No PowerShell:

```powershell
$env:SMOKE_EMAIL="email-do-admin"
$env:SMOKE_PASSWORD="senha-do-admin"
npm run test:routes
```

Para testar tambem criacao, edicao e limpeza de dados temporarios, use um usuario `ADMIN`:

```powershell
$env:SMOKE_EMAIL="email-do-admin"
$env:SMOKE_PASSWORD="senha-do-admin"
$env:SMOKE_MUTATE="true"
npm run test:routes
```

Se a API estiver em outra URL:

```powershell
$env:SMOKE_API_URL="http://localhost:3334"
npm run test:routes
```

## Autenticacao

Todas as rotas protegidas usam JWT no header:

```txt
Authorization: Bearer seu_token
```

Rotas publicas:

- `GET /`
- `POST /auth/login`
- `POST /auth/register`, usando `X-Admin-Key`

## Perfis e Permissoes

| Perfil | Uso no sistema | Permissoes principais |
| --- | --- | --- |
| `ADMIN` | Administrador da igreja | Configura igreja, cria usuarios, cria/edita/lanca e exclui dados |
| `TREASURER` | Tesoureiro | Cria e edita cultos, categorias e lancamentos; nao exclui dados |
| `PASTOR` | Pastor/lider | Visualiza painel, cultos, transacoes e relatorios |

Regra de negocio atual: exclusao de dados fica restrita ao `ADMIN`.

## Padroes Importantes

- Valores financeiros sao enviados em centavos. Exemplo: R$ 200,00 = `20000`.
- Datas podem ser enviadas como `YYYY-MM-DD` ou ISO date.
- Transacoes podem ser avulsas ou vinculadas a um culto com `cultoId`.
- Culto nao usa mais campo `type`; ele usa `categoryId`, ligado a uma categoria de culto.
- O nome do dizimista/ofertante pode ser omitido quando a igreja nao souber identificar o contribuinte.

## Mapa de Rotas

### Base

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/` | Publica | Dados basicos da API |

### Auth

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| POST | `/auth/register` | `X-Admin-Key` | Cria igreja e primeiro usuario `ADMIN` |
| POST | `/auth/login` | Publica | Autentica usuario e retorna token |

Exemplo de login:

```json
{
  "email": "admin@igreja.com",
  "password": "123456"
}
```

### Igreja

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/church` | Autenticado | Retorna dados da igreja do usuario logado |
| PUT | `/church` | `ADMIN` | Atualiza dados da igreja |

Exemplo de atualizacao:

```json
{
  "name": "IEQ Uberlandia Planalto",
  "cnpj": "00.000.000/0000-00",
  "city": "Uberlandia",
  "state": "MG",
  "phone": "(34) 99999-9999",
  "email": "contato@igreja.com"
}
```

### Usuarios

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/users` | `ADMIN` | Lista usuarios da igreja |
| POST | `/users` | `ADMIN` | Cria usuario na igreja |

Exemplo:

```json
{
  "name": "Nome do Usuario",
  "email": "usuario@igreja.com",
  "password": "123456",
  "role": "TREASURER"
}
```

Roles validas:

- `ADMIN`
- `TREASURER`
- `PASTOR`

### Categorias Financeiras

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/categories` | Autenticado | Lista categorias financeiras |
| POST | `/categories` | `ADMIN`, `TREASURER` | Cria categoria financeira |
| PUT | `/categories/:id` | `ADMIN`, `TREASURER` | Atualiza categoria financeira |
| DELETE | `/categories/:id` | `ADMIN` | Exclui categoria financeira |

Exemplo:

```json
{
  "title": "Oferta",
  "color": "#16A34A"
}
```

### Transacoes

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/transactions` | Autenticado | Lista transacoes com filtros |
| POST | `/transactions` | `ADMIN`, `TREASURER` | Cria transacao |
| PUT | `/transactions/:id` | `ADMIN`, `TREASURER` | Atualiza transacao |
| DELETE | `/transactions/:id` | `ADMIN` | Exclui transacao |
| GET | `/transactions/dashboard` | Autenticado | Retorna saldo, saldo em caixa e gastos por categoria |
| GET | `/transactions/financial-evolution` | Autenticado | Retorna evolucao financeira por ano |

Exemplo de transacao avulsa:

```json
{
  "title": "Conta de luz",
  "amount": 32000,
  "type": "expense",
  "date": "2026-06-03",
  "categoryId": "uuid-da-categoria"
}
```

Exemplo de transacao vinculada ao culto:

```json
{
  "title": "Oferta missionaria",
  "amount": 50000,
  "type": "income",
  "date": "2026-06-03",
  "categoryId": "uuid-da-categoria",
  "cultoId": "uuid-do-culto"
}
```

Filtros:

```txt
GET /transactions?beginDate=2026-06-01&endDate=2026-06-30
GET /transactions?categoryId=uuid-da-categoria
GET /transactions?title=luz
GET /transactions/dashboard?beginDate=2026-06-01&endDate=2026-06-30
GET /transactions/financial-evolution?year=2026
```

Tipos de transacao:

- `income`
- `expense`

### Cultos

#### Categorias de Culto

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/cultos/categorias` | Autenticado | Lista categorias de culto |
| POST | `/cultos/categorias` | `ADMIN`, `TREASURER` | Cria categoria de culto |
| DELETE | `/cultos/categorias/:id` | `ADMIN` | Exclui categoria de culto |

Exemplo:

```json
{
  "title": "Culto de Domingo"
}
```

#### Cultos

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/cultos` | Autenticado | Lista cultos |
| GET | `/cultos/:id` | Autenticado | Retorna detalhes do culto |
| POST | `/cultos` | `ADMIN`, `TREASURER` | Cria culto |
| PUT | `/cultos/:id` | `ADMIN`, `TREASURER` | Atualiza culto |
| DELETE | `/cultos/:id` | `ADMIN` | Exclui culto e dados vinculados |

Exemplo:

```json
{
  "date": "2026-06-03",
  "categoryId": "uuid-da-categoria-de-culto",
  "preacher": "Pr. Warley de Jesus da Silva"
}
```

#### Dizimos e Ofertas no Culto

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| POST | `/cultos/:id/dizimistas` | `ADMIN`, `TREASURER` | Adiciona dizimo/oferta ao culto |
| DELETE | `/cultos/:id/dizimistas/:dizimistaId` | `ADMIN` | Remove dizimo/oferta do culto |

Exemplo:

```json
{
  "name": "Maria Silva",
  "amount": 20000,
  "contributionType": "Dizimo"
}
```

`name` e `contributionType` sao opcionais.

#### Categorias e Registros Espirituais

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/cultos/categorias-espirituais` | Autenticado | Lista categorias espirituais |
| POST | `/cultos/categorias-espirituais` | `ADMIN`, `TREASURER` | Cria categoria espiritual |
| POST | `/cultos/:id/espiritual` | `ADMIN`, `TREASURER` | Adiciona registro espiritual ao culto |
| DELETE | `/cultos/:id/espiritual/:recordId` | `ADMIN` | Remove registro espiritual |

Exemplo de categoria:

```json
{
  "title": "Visitantes"
}
```

Exemplo de registro:

```json
{
  "categoryId": "uuid-da-categoria-espiritual",
  "value": 4
}
```

### Relatorios

| Metodo | Rota | Permissao | Descricao |
| --- | --- | --- | --- |
| GET | `/relatorios/culto/:cultoId` | Autenticado | Relatorio completo de um culto |
| GET | `/relatorios/periodo` | Autenticado | Relatorio financeiro e espiritual por periodo |
| GET | `/relatorios/anual` | Autenticado | Resumo anual mes a mes |

Exemplos:

```txt
GET /relatorios/culto/uuid-do-culto
GET /relatorios/periodo?beginDate=2026-06-01&endDate=2026-06-30
GET /relatorios/anual?year=2026
```

## Estrutura de Pastas

```txt
src/
  controllers/    # entrada HTTP, req/res/next
  services/       # regras de negocio
  database/       # Prisma client e repositories
  dtos/           # validacoes Zod e tipos derivados
  entities/       # entidades de dominio
  errors/         # erros personalizados
  factories/      # instancia os controllers/services
  middleware/     # auth, role, validator e error handler
  routes/         # definicao das rotas
scripts/          # seeds e testes manuais/automaticos
prisma/           # schema e migrations
```

## Guia de Manutencao

Ao criar uma nova funcionalidade na API:

1. Defina/ajuste o modelo no `prisma/schema.prisma`, se precisar.
2. Rode migration com `npx prisma migrate dev`.
3. Crie o DTO em `src/dtos`.
4. Implemente regra de negocio em `src/services`.
5. Crie controller em `src/controllers`.
6. Crie factory em `src/factories`.
7. Registre a rota em `src/routes`.
8. Proteja a rota com `authMiddleware` e `roleMiddleware` conforme a permissao.
9. Rode `npm run build`.
10. Rode `npm run test:routes` para validar o fluxo principal.

## Checklist Antes de Apresentar

```bash
npm run build
```

Depois, com a API rodando:

```powershell
$env:SMOKE_EMAIL="email-do-admin"
$env:SMOKE_PASSWORD="senha"
npm run test:routes
```

Resultado esperado:

```txt
Tudo certo. Checks aprovados: 16
```
