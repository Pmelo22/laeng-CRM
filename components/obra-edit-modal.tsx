"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { ObraComCliente } from "@/lib/types"
import { useRouter } from "next/navigation"

interface ObraEditModalProps {
  isOpen: boolean
  onClose: () => void
  obra?: ObraComCliente
}

interface ObraFinancialData {
  empreiteiro: number
  terceirizado: number
  material: number
  mao_de_obra: number
  pintor: number
  eletricista: number
  gesseiro: number
  azulejista: number
  manutencao: number
  empreiteiro_nome: string
  empreiteiro_valor_pago: number
}

export function ObraEditModal({ isOpen, onClose, obra }: ObraEditModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const [obraData, setObraData] = useState<ObraFinancialData>({
    empreiteiro: 0,
    terceirizado: 0,
    material: 0,
    mao_de_obra: 0,
    pintor: 0,
    eletricista: 0,
    gesseiro: 0,
    azulejista: 0,
    manutencao: 0,
    empreiteiro_nome: "",
    empreiteiro_valor_pago: 0,
  })

  // Carregar dados da obra quando o modal abrir
  useEffect(() => {
    if (isOpen && obra) {
      setObraData({
        empreiteiro: Number(obra.empreiteiro) || 0,
        terceirizado: Number(obra.terceirizado) || 0,
        material: Number(obra.material) || 0,
        mao_de_obra: Number(obra.mao_de_obra) || 0,
        pintor: Number(obra.pintor) || 0,
        eletricista: Number(obra.eletricista) || 0,
        gesseiro: Number(obra.gesseiro) || 0,
        azulejista: Number(obra.azulejista) || 0,
        manutencao: Number(obra.manutencao) || 0,
        empreiteiro_nome: obra.empreiteiro_nome || "",
        empreiteiro_valor_pago: Number(obra.empreiteiro_valor_pago) || 0,
      })
    }
  }, [isOpen, obra])

  const handleSave = async () => {
    if (!obra) return

    setIsLoading(true)
    try {
      // Atualizar valores financeiros da obra
      const { error: obraError } = await supabase
        .from("obras")
        .update({
          empreiteiro: obraData.empreiteiro,
          terceirizado: obraData.terceirizado,
          material: obraData.material,
          mao_de_obra: obraData.mao_de_obra,
          pintor: obraData.pintor,
          eletricista: obraData.eletricista,
          gesseiro: obraData.gesseiro,
          azulejista: obraData.azulejista,
          manutencao: obraData.manutencao,
          empreiteiro_nome: obraData.empreiteiro_nome,
          empreiteiro_valor_pago: obraData.empreiteiro_valor_pago,
          updated_at: new Date().toISOString()
        })
        .eq("id", obra.id)

      if (obraError) throw obraError

      toast({
        title: "✅ Obra atualizada!",
        description: `Os dados da obra foram atualizados com sucesso.`,
        duration: 3000,
      })

      router.refresh()
      onClose()
    } catch (error) {
      console.error("Erro ao atualizar obra:", error)
      toast({
        title: "❌ Erro ao atualizar",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ObraFinancialData, value: string) => {
    const numericValue = value.replace(/\D/g, '')
    const newValue = Number(numericValue) / 100
    setObraData(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const formatValue = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Calcular total = Empreiteiro + Material + Terceirizado (com especialistas)
  const totalCustos = 
    obraData.empreiteiro + 
    obraData.material + 
    obraData.terceirizado + 
    obraData.pintor + 
    obraData.eletricista + 
    obraData.gesseiro + 
    obraData.azulejista + 
    obraData.manutencao

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1E1E1E]">
            Editar Custos da Obra
          </DialogTitle>
          {obra && (
            <p className="text-sm text-muted-foreground">
              Obra #{String(obra.codigo).padStart(3, '0')} - {obra.cliente_nome}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seção de Custos Principais */}
          <div>
            <h3 className="text-base font-bold text-[#1E1E1E] mb-4">
              Custos Principais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Empreiteiro */}
              <div className="space-y-1">
                <Label htmlFor="empreiteiro" className="text-sm font-medium">
                  Empreiteiro (R$)
                </Label>
                <Input
                  id="empreiteiro"
                  type="text"
                  value={formatValue(obraData.empreiteiro)}
                  onChange={(e) => handleInputChange('empreiteiro', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Terceirizado */}
              <div className="space-y-1">
                <Label htmlFor="terceirizado" className="text-sm font-medium">
                  Terceirizado (R$)
                </Label>
                <Input
                  id="terceirizado"
                  type="text"
                  value={formatValue(obraData.terceirizado)}
                  onChange={(e) => handleInputChange('terceirizado', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Material */}
              <div className="space-y-1">
                <Label htmlFor="material" className="text-sm font-medium">
                  Material (R$)
                </Label>
                <Input
                  id="material"
                  type="text"
                  value={formatValue(obraData.material)}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Seção do Demonstrativo Financeiro do Empreiteiro */}
          <div>
            <h3 className="text-base font-bold text-[#1E1E1E] mb-4">
              Demonstrativo Financeiro do Empreiteiro
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nome do Empreiteiro */}
              <div className="space-y-1">
                <Label htmlFor="empreiteiro_nome" className="text-sm font-medium">
                  Nome do Empreiteiro
                </Label>
                <Input
                  id="empreiteiro_nome"
                  type="text"
                  value={obraData.empreiteiro_nome}
                  onChange={(e) => setObraData(prev => ({ ...prev, empreiteiro_nome: e.target.value }))}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] text-lg h-12 px-4"
                  placeholder="Nome do empreiteiro"
                />
              </div>

              {/* Valor Pago */}
              <div className="space-y-1">
                <Label htmlFor="empreiteiro_valor_pago" className="text-sm font-medium">
                  Valor Pago (R$)
                </Label>
                <Input
                  id="empreiteiro_valor_pago"
                  type="text"
                  value={formatValue(obraData.empreiteiro_valor_pago)}
                  onChange={(e) => handleInputChange('empreiteiro_valor_pago', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Saldo */}
              <div className="space-y-1">
                <Label htmlFor="empreiteiro_saldo" className="text-sm font-medium">
                  Saldo (R$)
                </Label>
                <Input
                  id="empreiteiro_saldo"
                  type="text"
                  value={formatValue(obraData.empreiteiro - obraData.empreiteiro_valor_pago)}
                  disabled
                  className="border-2 bg-gray-100 font-mono text-lg h-12 px-4 text-gray-600"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Seção de Terceirizados Especializados */}
          <div>
            <h3 className="text-base font-bold text-[#1E1E1E] mb-4">
              Terceirizados Especializados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pintor */}
              <div className="space-y-1">
                <Label htmlFor="pintor" className="text-sm font-medium">
                  Pintor (R$)
                </Label>
                <Input
                  id="pintor"
                  type="text"
                  value={formatValue(obraData.pintor)}
                  onChange={(e) => handleInputChange('pintor', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Eletricista */}
              <div className="space-y-1">
                <Label htmlFor="eletricista" className="text-sm font-medium">
                  Eletricista (R$)
                </Label>
                <Input
                  id="eletricista"
                  type="text"
                  value={formatValue(obraData.eletricista)}
                  onChange={(e) => handleInputChange('eletricista', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Gesseiro */}
              <div className="space-y-1">
                <Label htmlFor="gesseiro" className="text-sm font-medium">
                  Gesseiro (R$)
                </Label>
                <Input
                  id="gesseiro"
                  type="text"
                  value={formatValue(obraData.gesseiro)}
                  onChange={(e) => handleInputChange('gesseiro', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Azulejista */}
              <div className="space-y-1">
                <Label htmlFor="azulejista" className="text-sm font-medium">
                  Azulejista (R$)
                </Label>
                <Input
                  id="azulejista"
                  type="text"
                  value={formatValue(obraData.azulejista)}
                  onChange={(e) => handleInputChange('azulejista', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Manutenção */}
              <div className="space-y-1">
                <Label htmlFor="manutencao" className="text-sm font-medium">
                  Manutenção (R$)
                </Label>
                <Input
                  id="manutencao"
                  type="text"
                  value={formatValue(obraData.manutencao)}
                  onChange={(e) => handleInputChange('manutencao', e.target.value)}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Total de Custos */}
          <div className="bg-[#F5C800] p-6 rounded-lg">
            <p className="text-sm font-semibold text-[#1E1E1E] mb-2">
              Valor Total da Obra
            </p>
            <p className="text-3xl font-bold text-[#1E1E1E]">
              R$ {totalCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#1E1E1E]/70 mt-2">
              = Empreiteiro + Material + Terceirizado
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
