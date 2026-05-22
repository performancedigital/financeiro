export type AppModuleKey =
  | "dashboard"
  | "contas"
  | "clientes"
  | "receber"
  | "pagar"
  | "fluxo"
  | "dre"
  | "dividas"
  | "documentos"
  | "projecoes"
  | "importar"
  | "configuracoes"
  | "dashboard_pessoal"
  | "orcamento"
  | "investimentos"
  | "metas"
  | "gastos";

export type AppModule = {
  key: AppModuleKey;
  label: string;
  description: string;
};

export const empresaModules: AppModule[] = [
  { key: "dashboard", label: "Dashboard", description: "Visão executiva e KPIs" },
  { key: "contas", label: "Contas", description: "Contas bancárias e transações" },
  { key: "clientes", label: "Clientes", description: "Carteira, contratos e LTV" },
  { key: "receber", label: "A Receber", description: "Cobranças e inadimplência" },
  { key: "pagar", label: "A Pagar", description: "Despesas e compromissos" },
  { key: "fluxo", label: "Fluxo de Caixa", description: "Previsto x realizado" },
  { key: "dre", label: "DRE", description: "Resultado operacional e margem" },
  { key: "dividas", label: "Dívidas", description: "Empréstimos e financiamentos" },
  { key: "documentos", label: "Documentos", description: "Contratos e comprovantes" },
  { key: "projecoes", label: "Projeções", description: "Visão até dezembro" },
  { key: "importar", label: "Importar Dados", description: "Importação em massa via CSV" },
  { key: "configuracoes", label: "Configurações", description: "Categorias e preferências" },
];

export const pessoalModules: AppModule[] = [
  { key: "dashboard_pessoal", label: "Início", description: "Visão geral das finanças" },
  { key: "contas", label: "Contas", description: "Contas bancárias e saldos" },
  { key: "gastos", label: "Gastos", description: "Entradas e saídas pessoais" },
  { key: "orcamento", label: "Orçamento", description: "Limite de gastos por categoria" },
  { key: "investimentos", label: "Investimentos", description: "Carteira e rendimentos" },
  { key: "metas", label: "Metas", description: "Objetivos financeiros" },
  { key: "dividas", label: "Dívidas", description: "Empréstimos e financiamentos" },
  { key: "importar", label: "Importar", description: "Importar extrato bancário" },
  { key: "configuracoes", label: "Configurações", description: "Categorias e preferências" },
];

export const getModules = (workspaceType: string): AppModule[] =>
  workspaceType === "PESSOAL" ? pessoalModules : empresaModules;

export const findModuleIn = (modules: AppModule[], key: string) =>
  modules.find((m) => m.key === key);

// compatibilidade retroativa
export const appModules = empresaModules;
export const findModule = (key: string) => appModules.find((m) => m.key === key);
