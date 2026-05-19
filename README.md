# CaixaComando (MVP)

Plataforma web para gestão financeira de agência de marketing/performance, com separação clara entre:

- Pessoa Física (Helbert)
- Casa/Família
- Leidiane
- Empresa/Agência
- Viagens/Extraordinários
- Dívidas/Empréstimos
- Reembolsos
- Capital de giro

## Objetivo do MVP

Entregar rapidamente visão de decisão financeira (não só cadastro), cobrindo:

- Dashboard executivo com KPIs e alertas
- Contas a receber e contas a pagar
- Clientes, contratos e LTV básico
- Fluxo de caixa previsto x realizado
- DRE simplificada mensal
- Projeção até dezembro
- Upload de documentos
- Importação CSV (Nubank) + classificação por regras

## Stack alvo

- Next.js + React + TypeScript
- TailwindCSS + Shadcn UI
- PostgreSQL + Prisma
- NextAuth (ou Supabase Auth)
- TanStack Table + Recharts
- Zod + date-fns
- PapaParse (CSV), jsPDF/XLSX (exportação)

## Estrutura proposta

```txt
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    dashboard/
    forms/
    tables/
    charts/
    layout/
    ui/
  modules/
    accounts/
    clients/
    receivables/
    payables/
    cashflow/
    dre/
    debts/
    cards/
    documents/
    projections/
    reports/
  lib/
    finance/
    classifiers/
    importers/
    exporters/
    validators/
  server/
    repositories/
    services/
prisma/
  schema.prisma
```

## Como começar

1. Copie `.env.example` para `.env`.
2. Configure `DATABASE_URL`.
3. Rode migrações Prisma.
4. Rode seed inicial.
5. Suba a aplicação.

Comandos previstos:

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Entregáveis já definidos neste repositório

- Arquitetura funcional do MVP (`docs/ARQUITETURA.md`)
- Roadmap de entrega (`docs/ROADMAP_MVP.md`)
- Schema Prisma completo multiworkspace (`prisma/schema.prisma`)
- Variáveis base (`.env.example`)

## Próxima etapa recomendada

Implementar vertical slice completo:

1) Auth + Workspace  
2) Dashboard + KPIs  
3) Receber/Pagar + fluxo mensal  
4) Clientes/Contratos + LTV  
5) Importador CSV Nubank + motor de regras  
6) Relatório PDF mensal
