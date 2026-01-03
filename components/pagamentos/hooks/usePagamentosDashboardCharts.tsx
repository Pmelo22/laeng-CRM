import { useState, useMemo } from "react"
import { Pagamentos } from "@/lib/types"

export function usePagamentosCharts(data: Pagamentos[]) {
  const [chartMetric, setChartMetric] = useState<string>("category")

  const { donutReceitas, donutDespesas } = useMemo(() => {
    const receitasMap: Record<string, number> = {}
    const despesasMap: Record<string, number> = {}

    data.forEach((p) => {
      // Filtra apenas o que foi efetivamente pago
      if (p.status !== "pago") return

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
          key = p.method || "Outros"
          break
        default:
          key = "Geral"
      }

      const val = Number(p.amount) || 0
      if (p.type === "receita") {
        receitasMap[key] = (receitasMap[key] || 0) + val
      } else {
        despesasMap[key] = (despesasMap[key] || 0) + val
      }
    })

    const processData = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    return {
      donutReceitas: processData(receitasMap),
      donutDespesas: processData(despesasMap),
    }
  }, [data, chartMetric])

  return {
    chartMetric,
    setChartMetric,
    donutReceitas,
    donutDespesas,
  }
}