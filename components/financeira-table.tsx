"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ObraFinanceiro } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatMoneyInput, parseMoneyInput, formatCurrency, formatPercentage } from "@/lib/utils"
import { getStatusBadge } from "@/lib/status-utils"
import { useSortTable, usePagination, useExpandableRows, ExpandToggleButton } from "@/lib/table-utils"

interface FinanceiraTableProps {
  obras: ObraFinanceiro[]
}

interface MedicaoData {
  numero: number
  valor: number
  dataComputacao?: string
}

export function FinanceiraTable({ obras }: FinanceiraTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [medicaoEditando, setMedicaoEditando] = useState<MedicaoData | null>(null)
  const [obraIdEditando, setObraIdEditando] = useState<string | null>(null)
  const [isLoadingMedicao, setIsLoadingMedicao] = useState(false)

  // Hooks centralizados
  const { toggleRow, isExpanded } = useExpandableRows()
  const { handleSort, getSortIcon, sortedData: sortedObras } = useSortTable<ObraFinanceiro>(obras)
  const { currentPage, setCurrentPage, itemsPerPage, totalPages, startIndex, endIndex, paginatedData: paginatedObras, handleItemsPerPageChange, getPageNumbers } = usePagination(sortedObras, 20)

  const abrirEditorMedicao = (obraId: string, numeroMedicao: number, valorAtual: number, dataComputacao?: string) => {
    setObraIdEditando(obraId)
    setMedicaoEditando({
      numero: numeroMedicao,
      valor: valorAtual,
      dataComputacao: dataComputacao || undefined,
    })
  }

  const fecharEditorMedicao = () => {
    setMedicaoEditando(null)
    setObraIdEditando(null)
  }

  const salvarMedicao = async () => {
    if (!medicaoEditando || !obraIdEditando) return

    setIsLoadingMedicao(true)
    try {
      const obraEncontrada = obras.find(o => o.id === obraIdEditando)
      if (!obraEncontrada) throw new Error("Obra não encontrada")

      const dataComputacao = new Date().toISOString()
      const numeroMedicao = medicaoEditando.numero
      const campoMedicao = `medicao_0${numeroMedicao}`
      const campoDataComputacao = `medicao_0${numeroMedicao}_data_computacao`

      // Criar objeto de atualização dinamicamente
      const updateData: Record<string, string | number> = {
        [campoMedicao]: medicaoEditando.valor,
        [campoDataComputacao]: dataComputacao,
        updated_at: new Date().toISOString(),
      }

      // Atualizar a obra no Supabase
      const { error } = await supabase
        .from("obras")
        .update(updateData)
        .eq("id", obraIdEditando)

      if (error) throw error

      toast({
        title: "✅ Medição salva!",
        description: `Medição ${medicaoEditando.numero} atualizada com sucesso.`,
        duration: 3000,
      })

      fecharEditorMedicao()
      
      // Recarregar dados do servidor após um pequeno delay
      // para garantir que o banco de dados foi atualizado
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Erro ao salvar medição:", error)
      toast({
        title: "❌ Erro ao salvar",
        description: "Ocorreu um erro ao salvar a medição. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoadingMedicao(false)
    }
  }

  const formatarDataComputacao = (dataIso?: string) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
      <div className="overflow-x-auto relative">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
            <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
              <TableHead 
                className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('codigo')}
              >
                <div className="flex items-center">
                  CÓD.
                  {getSortIcon('codigo')}
                </div>
              </TableHead>
              <TableHead 
                className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('cliente_nome')}
              >
                <div className="flex items-center">
                  CLIENTE
                  {getSortIcon('cliente_nome')}
                </div>
              </TableHead>
              <TableHead 
                className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  STATUS
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('valor_total')}
              >
                <div className="flex items-center">
                  VALOR TOTAL
                  {getSortIcon('valor_total')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('total_medicoes_pagas')}
              >
                <div className="flex items-center">
                  RECEBIDO
                  {getSortIcon('total_medicoes_pagas')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('saldo_pendente')}
              >
                <div className="flex items-center">
                  A RECEBER
                  {getSortIcon('saldo_pendente')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('custo_total')}
              >
                <div className="flex items-center">
                  CUSTOS
                  {getSortIcon('custo_total')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('resultado')}
              >
                <div className="flex items-center">
                  RESULTADO
                  {getSortIcon('resultado')}
                </div>
              </TableHead>
              <TableHead 
                className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('percentual_pago')}
              >
                <div className="flex items-center justify-center">
                  PROGRESSO
                  {getSortIcon('percentual_pago')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedObras.length > 0 ? (
              paginatedObras.map((obra) => {
                const percentualRecebido = obra.percentual_pago || 0
                const resultado = obra.resultado || 0
                
                return (
                  <React.Fragment key={obra.id}>
                    <TableRow className="hover:bg-[#F5C800]/5 border-b">
                      {/* Código */}
                      <TableCell className="py-3">
                        <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                          #{String(obra.codigo).padStart(3, '0')}
                        </Badge>
                      </TableCell>

                      {/* Cliente */}
                      <TableCell className="font-medium py-3">
                        <span className="font-semibold text-sm">{obra.cliente_nome}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        {getStatusBadge(obra.status)}
                      </TableCell>

                      {/* Valor Total */}
                      <TableCell className="py-3 text-left min-w-[140px]">
                        <span className="text-sm font-bold text-black">
                          {formatCurrency(obra.valor_total || 0)}
                        </span>
                      </TableCell>

                      {/* Recebido */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-green-600">{formatCurrency(obra.total_medicoes_pagas || 0)}</div>
                          <ExpandToggleButton 
                            isExpanded={isExpanded(obra.id)} 
                            onClick={() => toggleRow(obra.id)}
                            title={isExpanded(obra.id) ? "Recolher detalhes" : "Ver detalhes das medições"}
                          />
                        </div>
                      </TableCell>

                      {/* A Receber */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(obra.saldo_pendente || 0)}
                        </span>
                      </TableCell>

                      {/* Custos */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(obra.custo_total || 0)}
                        </span>
                      </TableCell>

                      {/* Resultado */}
                      <TableCell className="py-3 text-left min-w-[140px]">
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-bold ${
                            resultado > 0 ? 'text-green-600' : resultado < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {formatCurrency(resultado)}
                          </span>
                          <span className={`text-xs font-bold ${
                            obra.margem_lucro > 0 ? 'text-green-600' : obra.margem_lucro < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {formatPercentage(obra.margem_lucro || 0)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Progresso */}
                      <TableCell className="py-3">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentualRecebido === 100
                                  ? 'bg-green-500'
                                  : percentualRecebido >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min(percentualRecebido, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600">
                            {formatPercentage(percentualRecebido)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Linha Expandida - Detalhamento de Medições */}
                    {isExpanded(obra.id) && (
                      <TableRow key={`${obra.id}-details`} className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={9} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-5 uppercase">
                              Detalhamento de Medições
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              {/* Medição 01 */}
                              <button
                                onClick={() => abrirEditorMedicao(obra.id, 1, obra.medicao_01 || 0, obra.medicao_01_data_computacao)}
                                className="bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-lg p-4 border border-gray-200 cursor-pointer transition-all hover:shadow-md active:scale-95 group relative"
                              >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 01</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_01 || 0)}
                                  </p>
                                  {obra.medicao_01_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_01_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 02 */}
                              <button
                                onClick={() => abrirEditorMedicao(obra.id, 2, obra.medicao_02 || 0, obra.medicao_02_data_computacao)}
                                className="bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-lg p-4 border border-gray-200 cursor-pointer transition-all hover:shadow-md active:scale-95 group relative"
                              >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 02</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_02 || 0)}
                                  </p>
                                  {obra.medicao_02_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_02_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 03 */}
                              <button
                                onClick={() => abrirEditorMedicao(obra.id, 3, obra.medicao_03 || 0, obra.medicao_03_data_computacao)}
                                className="bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-lg p-4 border border-gray-200 cursor-pointer transition-all hover:shadow-md active:scale-95 group relative"
                              >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 03</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_03 || 0)}
                                  </p>
                                  {obra.medicao_03_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_03_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 04 */}
                              <button
                                onClick={() => abrirEditorMedicao(obra.id, 4, obra.medicao_04 || 0, obra.medicao_04_data_computacao)}
                                className="bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-lg p-4 border border-gray-200 cursor-pointer transition-all hover:shadow-md active:scale-95 group relative"
                              >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 04</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_04 || 0)}
                                  </p>
                                  {obra.medicao_04_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_04_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 05 */}
                              <button
                                onClick={() => abrirEditorMedicao(obra.id, 5, obra.medicao_05 || 0, obra.medicao_05_data_computacao)}
                                className="bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-lg p-4 border border-gray-200 cursor-pointer transition-all hover:shadow-md active:scale-95 group relative"
                              >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 05</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_05 || 0)}
                                  </p>
                                  {obra.medicao_05_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_05_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="px-4 py-12 text-center">
                  <p className="text-gray-600 font-medium mb-2">Nenhuma obra encontrada</p>
                  <p className="text-sm text-gray-500">
                    Ajuste os filtros para ver mais resultados.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-semibold">
            Mostrando {startIndex + 1} - {Math.min(endIndex, sortedObras.length)} de {sortedObras.length} obras
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Obras por página:
            </span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px] h-9 border-[#F5C800]/30 focus:ring-[#F5C800] bg-background font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                <SelectItem value="20" className="cursor-pointer font-semibold">20</SelectItem>
                <SelectItem value="50" className="cursor-pointer font-semibold">50</SelectItem>
                <SelectItem value="100" className="cursor-pointer font-semibold">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navegação de páginas */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground font-semibold">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? "bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
                      : "border-[#F5C800]/30 hover:bg-[#F5C800]/10 font-semibold"
                  }
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Edição de Medição */}
      <Dialog open={medicaoEditando !== null} onOpenChange={(open) => !open && fecharEditorMedicao()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
              Editar Medição {medicaoEditando?.numero}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1E1E1E]">
                Valor da Medição (R$)
              </label>
              <Input
                type="text"
                value={formatMoneyInput(medicaoEditando?.valor || 0)}
                onChange={(e) => {
                  const valor = parseMoneyInput(e.target.value)
                  if (medicaoEditando) {
                    setMedicaoEditando({
                      ...medicaoEditando,
                      valor: valor,
                    })
                  }
                }}
                placeholder="0,00"
                className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
              />
            </div>

            {medicaoEditando?.dataComputacao && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-semibold mb-1">Última computação:</p>
                <p className="text-sm font-bold text-blue-900">
                  {formatarDataComputacao(medicaoEditando.dataComputacao)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={fecharEditorMedicao}
              disabled={isLoadingMedicao}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={salvarMedicao}
              disabled={isLoadingMedicao}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
            >
              {isLoadingMedicao ? "Salvando..." : "Salvar Medição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
