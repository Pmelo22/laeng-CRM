import { useState, useMemo } from "react"
import { Pagamentos } from "@/lib/types"

const getMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    cartao_credito: "Crédito",
    cartao_debito: "Débito",
    boleto: "Boleto",
    pix: "PIX",
    dinheiro: "Dinheiro", 
    transferencia: "Transf.",
  }
  return map[method] || method
}

export function usePagamentosCharts(data: Pagamentos[]) {
  const [chartMetric, setChartMetric] = useState<string>("category")

  const { 
    donutReceitas, donutDespesas,            
    donutReceitasPendente, donutDespesasPendente, 
    donutReceitasTotal, donutDespesasTotal     
  } = useMemo(() => {
    const recPago: Record<string, number> = {}
    const despPago: Record<string, number> = {}
    
    const recPendente: Record<string, number> = {}
    const despPendente: Record<string, number> = {}

    const recTotal: Record<string, number> = {}
    const despTotal: Record<string, number> = {}

    data.forEach((p) => {
      let key = "Outros"
      
      switch (chartMetric) {
        case "category":
          key = p.category_name || "Sem Categoria"
          break
        case "subcategory":
          key = p.subcategory_name || "Sem Subcategoria"
          break
        case "account":
          key = p.account_name || "Sem Conta"
          break
        case "method":
          key = getMethodLabel(p.method || 'Sem Método')
          break
        default:
          key = "Geral"
      }

      const val = Number(p.amount) || 0
      const isReceita = p.type === "receita"
      const isPago = p.status === "pago"

      if (isReceita) {
        recTotal[key] = (recTotal[key] || 0) + val
      } else {
        despTotal[key] = (despTotal[key] || 0) + val
      }

      if (isPago) {
        if (isReceita) recPago[key] = (recPago[key] || 0) + val
        else despPago[key] = (despPago[key] || 0) + val
      } else {
        if (isReceita) recPendente[key] = (recPendente[key] || 0) + val
        else despPendente[key] = (despPendente[key] || 0) + val
      }
    })

    const processData = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    return {
      donutReceitas: processData(recPago),
      donutDespesas: processData(despPago),
      donutReceitasPendente: processData(recPendente),
      donutDespesasPendente: processData(despPendente),
      donutReceitasTotal: processData(recTotal),
      donutDespesasTotal: processData(despTotal),
    }
  }, [data, chartMetric])

  return {
    chartMetric,
    setChartMetric,
    donutReceitas,
    donutDespesas,
    donutReceitasPendente,
    donutDespesasPendente,
    donutReceitasTotal,
    donutDespesasTotal
  }
}