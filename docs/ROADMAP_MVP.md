# Roadmap de implementação (MVP)

## Sprint 0 — Fundação técnica

- [ ] Criar app Next.js com TypeScript e Tailwind
- [ ] Configurar Prisma + PostgreSQL
- [ ] Implementar autenticação e sessão
- [ ] Definir layout base (sidebar, topbar, filtros globais)

## Sprint 1 — Núcleo financeiro

- [ ] CRUD de contas (`Account`)
- [ ] CRUD de transações (`Transaction`)
- [ ] Separação por tipo de caixa, instituição, categoria e centro de custo
- [ ] Anti-duplicidade de lançamentos
- [ ] Conciliação manual básica

## Sprint 2 — Receita recorrente

- [ ] CRUD de clientes (`Client`)
- [ ] CRUD de contratos (`Contract`)
- [ ] Contas a receber (`Receivable`)
- [ ] Cálculo de MRR, ARR, LTV e ticket médio
- [ ] Alertas de inadimplência e cobrança

## Sprint 3 — Despesas e caixa

- [ ] Contas a pagar (`Payable`)
- [ ] Dívidas/emprestimos (`Debt`)
- [ ] Retiradas/pró-labore (`Withdrawal`)
- [ ] Fluxo previsto x realizado por mês
- [ ] Projeção até dezembro

## Sprint 4 — Controladoria e documentos

- [ ] DRE simplificada mensal e anual acumulada
- [ ] Módulo de documentos com upload
- [ ] Módulo de provisões
- [ ] Alertas inteligentes e recomendações

## Sprint 5 — Importação e relatórios

- [ ] Importação CSV Nubank
- [ ] Motor de classificação por regra
- [ ] Relatório mensal PDF
- [ ] Exportações CSV/XLSX

## Critérios de aceite MVP

- Login funcional
- Dashboard com KPIs e gráficos principais
- Receber/Pagar operacionais
- Fluxo mensal + DRE simplificada
- Projeção até dezembro
- Importação CSV básica
- Relatório mensal exportável