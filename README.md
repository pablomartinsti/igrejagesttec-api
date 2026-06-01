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

### 🔜 Fase 3 — Cultos e espiritual _(em desenvolvimento)_

### 🔜 Fase 4 — Relatórios _(planejado)_
