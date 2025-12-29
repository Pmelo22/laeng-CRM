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
    recPaga: 0,
    recPendente: 0,
    despPaga: 0,
    despPendente: 0,
    saldoRealizado: 0,
    saldoPrevisto: 0,
  };

  const metrics = transactions.reduce((acc, p) => {
    const valor = Number(p.amount) || 0; 
    
    const isPago = p.status === 'pago';
    const isReceita = p.type === 'receita';
    const isDespesa = p.type === 'despesa';

    if (isReceita) {
      if (isPago) acc.recPaga += valor;
      else acc.recPendente += valor;
    } else if (isDespesa) {
      if (isPago) acc.despPaga += valor;
      else acc.despPendente += valor;
    }

    return acc;
  }, initialMetrics);

  metrics.saldoRealizado = metrics.recPaga - metrics.despPaga;
  metrics.saldoPrevisto = (metrics.recPaga + metrics.recPendente) - (metrics.despPaga + metrics.despPendente);

  return metrics;
};