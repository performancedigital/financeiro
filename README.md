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

4. (Opcional no MVP inicial) Suba schema no banco:

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
