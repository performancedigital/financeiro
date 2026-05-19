# CaixaComando (MVP)

Plataforma web para gestão financeira de agência de performance.

## Status atual

- Etapa 1 concluída: base Next.js + TypeScript + Tailwind + Prisma.
- Etapa 2 concluída: login funcional com sessão em cookie httpOnly e rota protegida (`/dashboard`).

## Credenciais MVP

- E-mail: `admin@caixacomando.local`
- Senha: `admin123`

## Requisitos

- Node.js 20+ (recomendado LTS)
- PostgreSQL

## Setup local

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Instale dependências:

```bash
npm install
```

3. Gere cliente Prisma:

```bash
npm run db:generate
```

4. Suba schema no banco:

```bash
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

## Importação CSV e orquestração dos dados

Quem orquestra a distribuição dos dados por aba é o backend (`/api/import/csv`).

Fluxo:

1. Você envia `kind` + `csv` em JSON.
2. O importador parseia colunas.
3. Mapeia para o tipo correto.
4. Persiste em PostgreSQL.
5. Cada aba lê do banco e exibe seus dados.

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
  -d "{\"kind\":\"accounts\",\"csv\":\"id,name,type,institution,balance\nacc1,Sicoob pessoal,PERSONAL_HELBERT,SICOOB,6200\"}"
```

## Variáveis de ambiente

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Deploy Vercel

Definir no projeto:

- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Environment Variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## Próximas etapas

- Etapa 3: shell premium (sidebar dinâmica, filtros globais, design system)
- Etapa 4: CRUD núcleo financeiro (contas/transações)
- Etapa 5+: clientes/contratos/receber/pagar/fluxo/DRE/importação/relatórios
