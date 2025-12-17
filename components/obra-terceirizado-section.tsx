"use client"

import { useState } from "react"
import { EditableValueModal } from "@/components/editable-value-modal"
import type { ObraComCliente } from "@/lib/types"

interface ObraTerceirizadoSectionProps {
  obra: ObraComCliente
  userPermissions: Record<string, any>
}

export function ObraTerceirizadoSection({ obra, userPermissions }: ObraTerceirizadoSectionProps) {

  const canEdit = userPermissions?.obras?.edit === true

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

  const handleCardClick = (
    fieldName: string,
    title: string,
    currentValue: number
  ) => {
    if (!canEdit) return

    setEditingModal({ fieldName, title, currentValue })
  }


  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {terceirizados.map((terceirizado) => (
        <button
          key={terceirizado.fieldName}
          onClick={
            canEdit
              ? () =>
                  handleCardClick(
                    terceirizado.fieldName,
                    terceirizado.title,
                    terceirizado.value
                  )
              : undefined
          }
          disabled={!canEdit}
          title={
            canEdit
              ? "Clique para editar"
              : "Você não tem permissão para editar este valor"
          }
          className={`
            rounded-lg p-4 border border-gray-200 transition-all group relative
            ${canEdit
              ? "bg-[#F5C800] hover:bg-[#F5C800]/90 cursor-pointer hover:shadow-md active:scale-95"
              : "bg-gray-200 cursor-not-allowed opacity-60"}
          `}
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
      {editingModal && canEdit && (
        <EditableValueModal
          isOpen
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
