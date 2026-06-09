# CaixaComando (MVP)

Plataforma web para gestão financeira de agência de performance.

## Status atual

- Base Next.js 16 + TypeScript + Tailwind 4 + Prisma 6 (PostgreSQL).
- Login/registro funcional com sessão em cookie httpOnly e rota protegida (`/dashboard`).
- CRUD completo (criar/editar/excluir) em contas, transações, clientes, contratos, a receber, a pagar, dívidas e documentos.
- Painel Pessoal com investimentos, metas e orçamento **persistidos no banco**.

## Acesso

Não há usuário pré-cadastrado. Crie a sua conta em **`/register`** (escolhendo workspace Empresa ou Pessoal). O primeiro login é feito com as credenciais que você cadastrar.

## Requisitos

- Node.js 20+ (recomendado LTS)
- PostgreSQL (local ou Supabase)

## Setup local

1. Copie o arquivo de ambiente e preencha as variáveis:

```bash
cp .env.example .env
```

2. Instale dependências:

```bash
npm install
```

3. Gere o cliente Prisma:

```bash
npm run db:generate
```

4. Aplique o schema no banco (migrations versionadas):

```bash
npm run db:deploy   # produção / banco já existente (prisma migrate deploy)
# ou, para desenvolvimento rápido em banco vazio:
npm run db:push
```

5. Execute a aplicação:

```bash
npm run dev
```

## Rotas

- `/login` -> autenticação
- `/dashboard` -> área protegida

## Persistência real (PostgreSQL)

O app agora usa PostgreSQL via Prisma para CRUD real dos módulos:

- contas
- transações
- clientes
- contratos
- contas a receber
- contas a pagar

Sem depender de mock em tela.

## Segurança e autorização

- Todas as APIs de dados exigem sessão válida.
- Cada operação usa `workspaceId` da sessão (isolamento por workspace).
- Credenciais atuais seguem em modo MVP, mas o acesso às rotas foi protegido.

## Importação CSV e orquestração dos dados

Quem orquestra a distribuição dos dados por aba é o backend (`/api/import/csv`).

Fluxo:

1. Você envia `kind` + `csv` em JSON.
2. O importador parseia colunas.
3. Mapeia para o tipo correto.
4. Persiste em PostgreSQL.
5. Cada aba lê do banco e exibe seus dados.

Agora com dois modos:

- `preview`: valida e mostra resumo (não grava)
- `commit`: persiste no banco

`kind` suportados:

- `accounts`
- `transactions`
- `clients`
- `contracts`
- `receivables`
- `payables`

Endpoint para limpar base (sem seed):

- `POST /api/import/clear`

Exemplo de chamada:

```bash
curl -X POST http://localhost:3000/api/import/csv ^
  -H "Content-Type: application/json" ^
  -d "{\"kind\":\"accounts\",\"mode\":\"preview\",\"csv\":\"id,name,type,institution,balance\nacc1,Sicoob pessoal,PERSONAL_HELBERT,SICOOB,6200\"}"
```

## Fluxo e DRE

- Fluxo mensal calculado por transações agrupadas por `YYYY-MM`.
- DRE simplificada calcula:
  - Receita bruta
  - Impostos
  - Equipe
  - Ferramentas
  - Pró-labore
  - Resultado operacional
  - Margem operacional

## Variáveis de ambiente

- `POSTGRES_PRISMA_URL` — conexão via pooler (runtime). Preenchida pela integração Supabase na Vercel.
- `POSTGRES_URL_NON_POOLING` — conexão direta (migrations). Preenchida pela integração Supabase na Vercel.
- `NEXTAUTH_SECRET` — chave de assinatura das sessões. **Obrigatória em produção** (gere com `openssl rand -base64 32`).

## Deploy Vercel

Definir no projeto:

- Framework: Next.js
- Install command: `npm install`
- Build command (já configurado em `vercel.json`): `prisma generate && prisma migrate deploy && next build --webpack`
- Environment Variables: `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `NEXTAUTH_SECRET`

O `prisma migrate deploy` no build aplica as migrations automaticamente. Recomendado usar um **banco Supabase novo** para o primeiro deploy, evitando conflito com tabelas pré-existentes criadas via `db push`.

## Próximas etapas

- Etapa 3: shell premium (sidebar dinâmica, filtros globais, design system)
- Etapa 4: CRUD núcleo financeiro (contas/transações)
- Etapa 5+: clientes/contratos/receber/pagar/fluxo/DRE/importação/relatórios
