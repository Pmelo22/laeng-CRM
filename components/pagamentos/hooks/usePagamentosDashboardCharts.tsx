import { useState, useMemo } from "react"
import { Pagamentos } from "@/lib/types"

export function usePagamentosCharts(data: Pagamentos[]) {
  const [chartMetric, setChartMetric] = useState<string>("category")

  const {
    donutReceitasTotal, donutDespesasTotal
  } = useMemo(() => {

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
        default:
          key = "Geral"
      }

      const val = Number(p.amount) || 0
      const isReceita = p.type === "receita"

      if (isReceita) {
        recTotal[key] = (recTotal[key] || 0) + val
      } else {
        despTotal[key] = (despTotal[key] || 0) + val
      }
    })

    const processData = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    return {
      donutReceitasTotal: processData(recTotal),
      donutDespesasTotal: processData(despTotal),
    }
  }, [data, chartMetric])

  return {
    chartMetric,
    setChartMetric,
    donutReceitasTotal,
    donutDespesasTotal
  }
}