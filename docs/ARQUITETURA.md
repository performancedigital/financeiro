# Arquitetura CaixaComando (MVP robusto)

## 1) Princípios de desenho

- **Separação financeira explícita**: toda movimentação deve ter `accountType`, `institution`, `category` e `costCenter`.
- **Tomada de decisão > cadastro**: dashboard, alertas, risco de caixa, DRE e projeções são cidadãos de primeira classe.
- **Multiworkspace desde o início**: todas as entidades relevantes com `workspaceId`.
- **Auditoria e segurança**: `createdAt`, `updatedAt`, `deletedAt` (soft delete) e rastreio por lote de importação.
- **MVP modular e expansível**: camadas desacopladas por domínio.

## 2) Camadas da solução

### Frontend (Next.js App Router)
- Rotas por domínio (`/dashboard`, `/clientes`, `/receber`, `/pagar`, `/fluxo`, `/dre`...).
- Componentes reutilizáveis de UI (cards, tabelas, filtros, modais, upload).
- Estado de filtros global por contexto (mês, conta, cliente, categoria, centro de custo).

### Backend (Route Handlers)
- Endpoints REST por módulo (`/api/clients`, `/api/receivables`, etc.).
- Serviços de domínio para métricas (MRR, ARR, LTV, churn, margem, risco).
- Camada de validação com Zod para entrada e saída.

### Dados (PostgreSQL + Prisma)
- Schema orientado a controladoria.
- Soft delete nas entidades operacionais.
- Índices para consultas por competência, status, cliente e datas de vencimento.

### Documentos e importação
- Upload em bucket (Supabase/S3).
- `ImportBatch` para rastrear origem e status dos imports.
- `ClassificationRule` para aprendizagem incremental de classificação.

## 3) Módulos do MVP

1. **Auth e Workspace**
2. **Dashboard executivo**
3. **Contas e transações**
4. **Clientes e contratos**
5. **Contas a receber**
6. **Contas a pagar**
7. **Fluxo de caixa mensal**
8. **DRE simplificada**
9. **Dívidas e retiradas**
10. **Documentos**
11. **Projeções e provisões**
12. **Importador CSV Nubank + regras**
13. **Relatório mensal PDF/XLSX**
14. **Motor de alertas e recomendações**

## 4) KPIs e visão executiva (MVP)

- Saldo consolidado / pessoal / empresa
- Receber e pagar do mês
- Previsto x realizado
- Pró-labore retirado x permitido
- Inadimplência e clientes em atraso
- Dívidas totais e próximos 30 dias
- Reserva e risco de caixa

## 5) Escalabilidade (próximas versões)

- Open Finance / Pluggy / Belvo
- Conciliação bancária semiautomática
- Motor de previsão com sazonalidade
- Papéis e permissões avançadas
- Centro de custo analítico por projeto