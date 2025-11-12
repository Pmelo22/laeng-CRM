"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Building2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ObrasTableFull } from "@/components/obras-table-full"
import type { ObraComCliente } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ObrasPageContentProps {
  obras: ObraComCliente[]
}

export default function ObrasPageContent({ obras }: ObrasPageContentProps) {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFinalizados, setShowFinalizados] = useState(false)

  // Scroll para a obra destacada quando a página carregar
  useEffect(() => {
    if (highlightId) {
      setTimeout(() => {
        const element = document.getElementById(`obra-${highlightId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('highlight-pulse')
          setTimeout(() => {
            element.classList.remove('highlight-pulse')
            // Remover o highlight da URL após a animação
            window.history.replaceState({}, '', '/dashboard/obras')
          }, 3000)
        }
      }, 500)
    }
  }, [highlightId])

  // Filtrar obras baseado no toggle de finalizados
  const obrasVisiveis = useMemo(() => {
    if (showFinalizados) {
      return obras
    }
    return obras.filter(o => o.status !== 'FINALIZADO')
  }, [obras, showFinalizados])

  // Calcular métricas
  const metrics = useMemo(() => {
    const finalizadas = obras.filter(o => o.status === 'FINALIZADO').length
    const emAndamento = obras.filter(o => o.status === 'EM ANDAMENTO').length
    const pendentes = obras.filter(o => o.status === 'PENDENTE' || !o.status).length
    const valorTotal = obras.reduce((sum, o) => sum + (o.valor_total || 0), 0)
    
    return {
      total: obras.length,
      finalizadas,
      emAndamento,
      pendentes,
      valorTotal
    }
  }, [obras])

  // Filtrar obras
  const filteredObras = useMemo(() => {
    return obrasVisiveis.filter(obra => {
      const term = searchTerm.toLowerCase().replace('#', '')
      const codigoFormatado = String(obra.codigo || 0).padStart(3, '0')
      
      const matchesSearch = !searchTerm || 
        obra.cliente_nome?.toLowerCase().includes(term) ||
        codigoFormatado.includes(term) ||
        obra.codigo?.toString().includes(term) ||
        obra.endereco?.toLowerCase().includes(term) ||
        obra.responsavel?.toLowerCase().includes(term)
      
      const matchesStatus = statusFilter === 'all' || obra.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [obrasVisiveis, searchTerm, statusFilter])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header com cores do sistema */}
      <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Título e métricas */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight uppercase">
              GESTÃO DE OBRAS
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="secondary" className="bg-[#F5C800] text-[#1E1E1E] border-[#F5C800] hover:bg-[#F5C800]/90 px-3 py-1.5 font-bold text-sm">
                <Building2 className="h-4 w-4 mr-1.5" />
                <span>{metrics.total}</span>
                <span className="ml-1.5">Obras</span>
              </Badge>
              <span className="text-[#F5C800] hidden sm:inline">•</span>
              <Badge variant="secondary" className="bg-green-600 text-white border-green-600 hover:bg-green-700 px-3 py-1.5 font-semibold text-sm">
                <span>{metrics.finalizadas}</span>
                <span className="ml-1.5">Finalizadas</span>
              </Badge>
              <span className="text-[#F5C800] hidden sm:inline">•</span>
              <Badge variant="secondary" className="bg-red-600 text-white border-red-600 hover:bg-red-700 px-3 py-1.5 font-semibold text-sm">
                <span>{metrics.emAndamento}</span>
                <span className="ml-1.5">Em Andamento</span>
              </Badge>
              <span className="text-[#F5C800] hidden sm:inline">•</span>
              <Badge variant="secondary" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 px-3 py-1.5 font-semibold text-sm">
                <span>{metrics.pendentes}</span>
                <span className="ml-1.5">Pendentes</span>
              </Badge>
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch">
            {/* Campo de busca */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#F5C800] transition-colors" />
              <Input
                placeholder="Buscar por cliente, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white border-[#F5C800]/30 text-gray-900 placeholder:text-gray-500 focus:border-[#F5C800] focus:ring-[#F5C800] focus:ring-2 rounded-lg shadow-sm transition-all text-sm sm:text-base"
              />
            </div>

            {/* Filtro */}
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 sm:!w-[180px] !h-10 sm:!h-12 px-4 sm:px-6 bg-white border-[#F5C800]/30 rounded-lg shadow-sm hover:border-[#F5C800] transition-colors whitespace-nowrap font-semibold text-[#1E1E1E] text-sm sm:text-base">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-[#1E1E1E]" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="FINALIZADO">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-600" />
                      Finalizado
                    </div>
                  </SelectItem>
                  <SelectItem value="EM ANDAMENTO">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-600" />
                      Em Andamento
                    </div>
                  </SelectItem>
                  <SelectItem value="PENDENTE">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-600" />
                      Pendente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setShowFinalizados(!showFinalizados)}
                variant="outline"
                className={`flex-1 sm:!w-[220px] !h-10 sm:!h-12 px-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  showFinalizados
                    ? 'bg-[#F5C800] text-[#1E1E1E] border-[#F5C800] hover:bg-[#F5C800]/90'
                    : 'bg-white text-[#1E1E1E] border-[#F5C800]/30 hover:border-[#F5C800]'
                }`}
              >
                {showFinalizados ? (
                  <>
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Finalizadas Visíveis</span>
                    <span className="xs:hidden">Visível</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Mostrar Finalizadas</span>
                    <span className="xs:hidden">Mostrar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo - Tabela */}
      <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <ObrasTableFull obras={filteredObras} highlightId={highlightId} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
