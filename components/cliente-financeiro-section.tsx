"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { EditableValueModal } from "@/components/editable-value-modal"
import type { Obra } from "@/lib/types"

interface ClienteFinanceiroSectionProps {
  obras: Obra[]
  clienteId: string
  userPermissions: Record<string, any>
}

export function ClienteFinanceiroSection({
  obras,
  clienteId,
  userPermissions
}: ClienteFinanceiroSectionProps) {
  const [editingModal, setEditingModal] = useState<{
    fieldName: string
    title: string
    currentValue: number
    obraId: string
  } | null>(null)

  // Calcular totais agregados das obras
  const entrada = obras?.reduce((sum, obra) => sum + (obra.entrada || 0), 0) || 0
  const valorFinanciado = obras?.reduce((sum, obra) => sum + (obra.valor_financiado || 0), 0) || 0
  const subsidio = obras?.reduce((sum, obra) => sum + (obra.subsidio || 0), 0) || 0
  const valorContratual = entrada + valorFinanciado + subsidio

  const canEdit = userPermissions?.clientes?.edit

  const handleCardClick = (
    fieldName: string,
    title: string,
    currentValue: number
  ) => {
    if (!canEdit) return

    const primeiraObra = obras?.[0]
    if (primeiraObra) {
      setEditingModal({
        fieldName,
        title,
        currentValue,
        obraId: primeiraObra.id,
      })
    }
  }

  const financeiroFields = [
    { fieldName: "entrada", title: "Entrada", value: entrada, label: "ENTRADA" },
    { fieldName: "valor_financiado", title: "Valor Financiado", value: valorFinanciado, label: "VALOR FINANCIADO" },
    { fieldName: "subsidio", title: "Subsídio", value: subsidio, label: "SUBSÍDIO" },
  ]

  return (
    <>
      <Card className="border-2 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl uppercase">
            <DollarSign className="h-4 w-4 text-green-600" />
            DADOS FINANCEIROS
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          {/* Grid com 4 cards de valores financeiros - Full width e maior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Card Principal: Valor Contratual (não editável) */}
            <Card className="border border-[#F5C800] bg-[#F5C800]">
              <CardContent className="pt-6 pb-6 px-6">
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium text-[#1E1E1E] uppercase">VALOR CONTRATUAL</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
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
                onClick={
                  canEdit
                    ? () => handleCardClick(field.fieldName, field.title, field.value)
                    : undefined
                }
                title={
                  canEdit
                    ? "Clique para editar"
                    : "Você não tem permissão para editar valores"
                }
                className={`
                  transition-all
                  ${canEdit
                    ? "cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95"
                    : "cursor-not-allowed opacity-60"}
                `}
                disabled={!canEdit}
              >
                <Card className="border border-yellow-200 bg-yellow-200 h-full">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#1E1E1E] uppercase">
                        {field.label}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
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
      {editingModal && canEdit && (
        <EditableValueModal
          isOpen
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
