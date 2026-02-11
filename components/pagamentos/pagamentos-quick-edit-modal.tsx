"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils"
import { isoToBR, brToISO, maskDateInput } from "./libs/pagamentos-financial"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { useQuickEdit } from "./hooks/usePagamentosQuickEdit"

interface PagamentosQuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  currentValue: any
  currentValueSecondary?: any
  fieldName: string
  fieldNameSecondary?: string
  tableId: string
  type: "text" | "money" | "date" | "select" | "category_tree"
  options?: any[]
  extraOptions?: { label: string; value: string }[]
}

//COMPONENTE GENÉRICO PARA EDIÇÃO RAPIDAS DE PAGAMENTOS

export function PagamentosQuickEditModal(props: PagamentosQuickEditModalProps) {
  const { isOpen, onClose, title, type, options, extraOptions } = props

  const { value, setValue, isLoading, step, setStep, selectedCategory, selectedSubcategory, setSelectedSubcategory, filteredSubcategories, handleCategorySelect, handleSave
  } = useQuickEdit(props)

  const renderInput = () => {
    switch (type) {
      case "category_tree":
        return (
          <div className="space-y-4">
            {/* Indicador de Passos */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`flex-1 h-2 rounded-full transition-colors ${step === 'category' || step === 'subcategory' ? 'bg-[#F5C800]' : 'bg-gray-200'}`}
              />
              <div
                className={`flex-1 h-2 rounded-full transition-colors ${step === 'subcategory' ? 'bg-[#F5C800]' : 'bg-gray-200'}`}
              />
            </div>

            {step === "category" ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <Label className="text-gray-500 font-semibold uppercase text-xs">Selecione a Categoria</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {extraOptions?.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        handleCategorySelect(cat.value)
                        // Se mudou de categoria, reseta subcategoria
                        if (cat.value !== selectedCategory) setSelectedSubcategory("")
                        setStep("subcategory")
                      }}
                      className={`
                                        p-3 rounded-lg border-2 text-left text-sm font-semibold transition-all
                                        ${selectedCategory === cat.value
                          ? 'border-[#F5C800] bg-[#F5C800]/10 text-[#1E1E1E]'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}
                                    `}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-500 font-semibold uppercase text-xs">Selecione a Subcategoria</Label>
                  <button onClick={() => setStep("category")} className="text-xs text-[#F5C800] font-bold hover:underline">
                    Voltar
                  </button>
                </div>

                {filteredSubcategories.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                    {filteredSubcategories.map((sub: any) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubcategory(sub.id)}
                        className={`
                                            p-3 rounded-lg border-2 text-left text-sm font-medium transition-all flex justify-between items-center
                                            ${selectedSubcategory === sub.id
                            ? 'border-[#F5C800] bg-[#F5C800]/10 text-[#1E1E1E]'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}
                                        `}
                      >
                        {sub.name}
                        {selectedSubcategory === sub.id && <Check className="h-4 w-4 text-[#F5C800]" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-sm">Nenhuma subcategoria encontrada.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      case "money":
        return (
          <Input
            value={formatMoneyInput(value)}
            onChange={(e) => setValue(parseMoneyInput(e.target.value))}
            className="font-mono text-lg h-14"
            autoFocus
          />
        )
      case "select":
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="h-14 text-lg">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "date":
        return (
          <Input
            type="text"
            placeholder="DD/MM/AAAA"
            value={isoToBR(value || '')}
            onChange={(e) => {
              const masked = maskDateInput(e.target.value)
              const iso = brToISO(masked)
              setValue(iso || masked)
            }}
            className="h-14 text-lg"
            maxLength={10}
          />
        )
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-lg h-14"
          />
        )
    }
  }

  const renderFooter = () => {
    if (type === 'category_tree') {
      if (step === 'category') {
        return (
          <Button
            className="bg-gray-100 text-gray-400 hover:bg-gray-200 w-full"
            disabled={true}
          >
            Selecione uma categoria
          </Button>
        )
      }
      return (
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !selectedSubcategory}
            className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#E5B800] font-bold flex-1"
          >
            {isLoading ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      )
    }

    return (
      <div className="flex gap-3 justify-end w-full">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading} className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#E5B800] font-bold">
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-full p-0 rounded-lg overflow-hidden">
        <div className="bg-[#1E1E1E] text-white px-6 py-4 flex justify-between items-center">
          <DialogTitle className="text-xl font-bold uppercase">{title}</DialogTitle>
        </div>
        <div className="px-6 py-6 bg-white space-y-4">
          {renderInput()}
        </div>
        <div className="bg-gray-50 border-t px-6 py-4 flex gap-3 justify-end">
          {renderFooter()}
        </div>
      </DialogContent>
    </Dialog>
  )
}