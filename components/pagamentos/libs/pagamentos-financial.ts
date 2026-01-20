import { FinancialMetrics, Pagamentos } from "@/lib/types";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const calculateFinancialMetrics = (transactions: Pagamentos[]): FinancialMetrics => {
  const initialMetrics: FinancialMetrics = {
    totalCount: transactions.length,
    despesaCount: transactions.filter((p) => p.type === "despesa").length,
    receitaCount: transactions.filter((p) => p.type === "receita").length,
    receitaTotal: 0,
    despesaTotal: 0,
    saldo: 0,
  };

  const metrics = transactions.reduce((acc, p) => {
    const valor = Number(p.amount) || 0;

    const isReceita = p.type === 'receita';
    const isDespesa = p.type === 'despesa';

    if (isReceita) {
      acc.receitaTotal += valor;
    } else if (isDespesa) {
      acc.despesaTotal += valor;
    }

    return acc;
  }, initialMetrics);

  metrics.saldo = metrics.receitaTotal - metrics.despesaTotal;

  return metrics;
};

export const calculateCategoryBalances = (data: Pagamentos[]) => {
  const groups: Record<string, { entradas: number; saidas: number }> = {};

  data.forEach(p => {
    const cat = p.category_name || "Sem Categoria";
    if (!groups[cat]) groups[cat] = { entradas: 0, saidas: 0 };

    const val = Number(p.amount) || 0;
    if (p.type === "receita") groups[cat].entradas += val;
    else groups[cat].saidas += val;
  });

  return Object.entries(groups)
    .map(([name, vals]) => ({
      name,
      ...vals,
      saldo: vals.entradas - vals.saidas,
      volume: vals.entradas + vals.saidas
    }))
    .sort((a, b) => b.volume - a.volume);
};

export const calculateDailyFlow = (data: Pagamentos[]) => {
  const grouped: Record<string, { date: string; receita: number; despesa: number }> = {};

  data.forEach(p => {
    if (!p.date) return;
    const dateKey = p.date.split("T")[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = { date: dateKey, receita: 0, despesa: 0 };
    }

    const val = Number(p.amount) || 0;
    if (p.type === "receita") grouped[dateKey].receita += val;
    else grouped[dateKey].despesa += val;
  });

  return Object.values(grouped)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateProgress = (val: number, total: number) => {
  if (total === 0) return val > 0 ? 100 : 0
  return Math.min((val / total) * 100, 100)
}