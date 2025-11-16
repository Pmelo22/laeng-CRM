"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { EditableValueModal } from "@/components/editable-value-modal"
import type { Obra } from "@/lib/types"

interface ClienteFinanceiroSectionProps {
  obras: Obra[]
}

export function ClienteFinanceiroSection({
  obras,
}: ClienteFinanceiroSectionProps) {
  const [editingModal, setEditingModal] = useState<{
    fieldName: string
    title: string
    currentValue: number
    obraId: string
  } | null>(null)

  // Calcular totais agregados das obras
  const valorTerreno = obras?.reduce((sum, obra) => sum + (obra.valor_terreno || 0), 0) || 0
  const entrada = obras?.reduce((sum, obra) => sum + (obra.entrada || 0), 0) || 0
  const valorFinanciado = obras?.reduce((sum, obra) => sum + (obra.valor_financiado || 0), 0) || 0
  const subsidio = obras?.reduce((sum, obra) => sum + (obra.subsidio || 0), 0) || 0
  const valorContratual = valorTerreno + entrada + valorFinanciado + subsidio

  const handleCardClick = (fieldName: string, title: string, currentValue: number) => {
    // Se há apenas uma obra, edita diretamente
    // Se há múltiplas obras, edita a primeira (comportamento simplificado)
    const primeiraObra = obras?.[0]
    if (primeiraObra) {
      setEditingModal({ 
        fieldName, 
        title, 
        currentValue,
        obraId: primeiraObra.id 
      })
    }
  }

  const financeiroFields = [
    { fieldName: "valor_terreno", title: "Terreno", value: valorTerreno, label: "TERRENO" },
    { fieldName: "entrada", title: "Entrada", value: entrada, label: "ENTRADA" },
    { fieldName: "valor_financiado", title: "Valor Financiado", value: valorFinanciado, label: "VALOR FINANCIADO" },
    { fieldName: "subsidio", title: "Subsídio", value: subsidio, label: "SUBSÍDIO" },
  ]

  return (
    <>
      <Card className="border-2 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base uppercase">
            <DollarSign className="h-4 w-4 text-green-600" />
            DADOS FINANCEIROS
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          {/* Grid com 5 cards de valores financeiros - Mais compacto */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* Card Principal: Valor Contratual (não editável) */}
            <Card className="border border-[#F5C800] bg-[#F5C800]">
              <CardContent className="pt-3 pb-3 px-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#1E1E1E] uppercase">VALOR CONTRATUAL</p>
                  <p className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(valorContratual)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cards editáveis */}
            {financeiroFields.map((field) => (
              <button
                key={field.fieldName}
                onClick={() => handleCardClick(field.fieldName, field.title, field.value)}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Card className="border border-yellow-200 bg-yellow-200 h-full">
                  <CardContent className="pt-3 pb-3 px-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#1E1E1E] uppercase">{field.label}</p>
                      <p className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(field.value)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal para editar valores */}
      {editingModal && (
        <EditableValueModal
          isOpen={!!editingModal}
          onClose={() => setEditingModal(null)}
          title={editingModal.title}
          currentValue={editingModal.currentValue}
          fieldName={editingModal.fieldName}
          tableId={editingModal.obraId}
          tableName="obras"
        />
      )}
    </>
  )
}
