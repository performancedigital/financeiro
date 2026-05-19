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
  | "relatorios";

export type AppModule = {
  key: AppModuleKey;
  label: string;
  description: string;
};

export const appModules: AppModule[] = [
  { key: "dashboard", label: "Dashboard", description: "Visao executiva e KPIs" },
  { key: "contas", label: "Contas", description: "Contas, caixas e instituicoes" },
  { key: "clientes", label: "Clientes", description: "Carteira, contratos e LTV" },
  { key: "receber", label: "A Receber", description: "Cobrancas e inadimplencia" },
  { key: "pagar", label: "A Pagar", description: "Despesas e compromissos" },
  { key: "fluxo", label: "Fluxo de Caixa", description: "Previsto x realizado" },
  { key: "dre", label: "DRE", description: "Resultado operacional e margem" },
  { key: "dividas", label: "Dividas", description: "Emprestimos e simulacoes" },
  { key: "documentos", label: "Documentos", description: "Contratos e comprovantes" },
  { key: "projecoes", label: "Projecoes", description: "Visao ate dezembro" },
  { key: "relatorios", label: "Relatorios", description: "PDF e Excel executivos" },
];

export const findModule = (key: string) => appModules.find((item) => item.key === key);
