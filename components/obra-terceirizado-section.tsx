"use client"

import { useState } from "react"
import { EditableValueModal } from "@/components/editable-value-modal"
import type { ObraComCliente } from "@/lib/types"

interface ObraTerceirizadoSectionProps {
  obra: ObraComCliente
}

export function ObraTerceirizadoSection({ obra }: ObraTerceirizadoSectionProps) {
  const [editingModal, setEditingModal] = useState<{
    fieldName: string
    title: string
    currentValue: number
  } | null>(null)

  const terceirizados = [
    { fieldName: "pintor", title: "Pintor", value: obra.pintor || 0, label: "PINTOR" },
    { fieldName: "eletricista", title: "Eletricista", value: obra.eletricista || 0, label: "ELETRICISTA" },
    { fieldName: "gesseiro", title: "Gesseiro", value: obra.gesseiro || 0, label: "GESSEIRO" },
    { fieldName: "azulejista", title: "Azulejista", value: obra.azulejista || 0, label: "AZULEJISTA" },
    { fieldName: "manutencao", title: "Manutenção", value: obra.manutencao || 0, label: "MANUTENÇÃO" },
  ]

  const handleCardClick = (fieldName: string, title: string, currentValue: number) => {
    setEditingModal({ fieldName, title, currentValue })
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {terceirizados.map((terceirizado) => (
          <button
            key={terceirizado.fieldName}
            onClick={() => handleCardClick(terceirizado.fieldName, terceirizado.title, terceirizado.value)}
            className="bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-lg p-4 border border-gray-200 cursor-pointer transition-all hover:shadow-md active:scale-95 group relative"
          >
            <div className="text-left">
              <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">{terceirizado.label}</p>
              <p className="text-base font-bold text-[#1E1E1E]">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(terceirizado.value)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal para editar valores */}
      {editingModal && (
        <EditableValueModal
          isOpen={!!editingModal}
          onClose={() => setEditingModal(null)}
          title={editingModal.title}
          currentValue={editingModal.currentValue}
          fieldName={editingModal.fieldName}
          tableId={obra.id}
          tableName="obras"
        />
      )}
    </>
  )
}
