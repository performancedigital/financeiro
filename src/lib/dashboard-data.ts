export type KpiCard = {
  label: string;
  value: string;
  trend?: string;
  tone: "positive" | "warning" | "danger" | "neutral" | "info";
};

export const dashboardKpis: KpiCard[] = [
  { label: "Saldo consolidado", value: "R$ 36.550,00", trend: "+4,2%", tone: "positive" },
  { label: "Saldo pessoal", value: "R$ 10.750,00", trend: "+2,1%", tone: "neutral" },
  { label: "Saldo empresa", value: "R$ 25.800,00", trend: "+5,0%", tone: "info" },
  { label: "Contas a receber (mes)", value: "R$ 32.400,00", trend: "11 clientes", tone: "info" },
  { label: "Contas a pagar (mes)", value: "R$ 19.780,00", trend: "27 lancamentos", tone: "warning" },
  { label: "Caixa previsto (fim do mes)", value: "R$ 12.620,00", trend: "saudavel", tone: "positive" },
  { label: "Caixa realizado", value: "R$ 10.940,00", trend: "84% do previsto", tone: "neutral" },
  { label: "Dif. previsto x realizado", value: "-R$ 1.680,00", trend: "atencao", tone: "warning" },
  { label: "Pro-labore retirado", value: "R$ 5.800,00", trend: "dentro do limite", tone: "positive" },
  { label: "Pro-labore permitido", value: "R$ 7.200,00", trend: "margem disponivel", tone: "info" },
  { label: "Clientes pagos", value: "7", trend: "de 11", tone: "positive" },
  { label: "Clientes pendentes", value: "4", trend: "2 em atraso", tone: "warning" },
  { label: "Inadimplencia", value: "18,2%", trend: "meta < 10%", tone: "danger" },
  { label: "Dividas totais", value: "R$ 52.400,00", trend: "em queda", tone: "warning" },
  { label: "Parcelas proximos 30 dias", value: "R$ 6.350,00", trend: "4 compromissos", tone: "warning" },
  { label: "Ferramentas recorrentes", value: "R$ 2.180,00", trend: "12 assinaturas", tone: "neutral" },
  { label: "Equipe a pagar", value: "R$ 8.600,00", trend: "fixo mensal", tone: "neutral" },
  { label: "Reserva pessoal", value: "R$ 4.100,00", trend: "0,8 mes", tone: "warning" },
  { label: "Reserva empresa", value: "R$ 9.700,00", trend: "1,3 mes", tone: "positive" },
  { label: "Risco de caixa", value: "VERDE", trend: "monitorado", tone: "positive" },
];

export const quickAlerts = [
  "2 clientes com mais de 5 dias de atraso.",
  "Pro-labore dentro do limite recomendado.",
  "Ferramenta 'Hostinger' sem cliente vinculado.",
  "Receita projetada cobre despesas fixas ate dezembro.",
];
