"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, CheckCircle2, Clock, XCircle, Filter } from "lucide-react"
import { ClientesTable } from "@/components/clientes-table"
import { ClienteModal } from "@/components/cliente-modal"
import type { Cliente } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ClientesPageContentProps {
  clientes: Cliente[]
}

export default function ClientesPageContent({ clientes }: ClientesPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calcular métricas
  const metrics = useMemo(() => {
    const finalizados = clientes.filter(c => c.status === 'FINALIZADO').length
    const emAndamento = clientes.filter(c => c.status === 'EM ANDAMENTO').length
    const pendentes = clientes.filter(c => c.status === 'PENDENTE' || !c.status).length
    
    return {
      total: clientes.length,
      finalizados,
      emAndamento,
      pendentes
    }
  }, [clientes])

  // Filtrar clientes
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = !searchTerm || 
        cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.codigo?.toString().includes(searchTerm) ||
        cliente.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || cliente.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [clientes, searchTerm, statusFilter])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header com cores do sistema */}
      <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Título e métricas */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight uppercase">
              Gestão de Clientes
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="secondary" className="bg-[#F5C800] text-[#1E1E1E] border-[#F5C800] hover:bg-[#F5C800]/90 px-3 py-1.5 font-bold text-sm">
                <span>{metrics.total}</span>
                <span className="ml-1.5">Cadastrados</span>
              </Badge>
              <span className="text-[#F5C800] hidden sm:inline">•</span>
              <Badge variant="secondary" className="bg-green-600 text-white border-green-600 hover:bg-green-700 px-3 py-1.5 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                <span>{metrics.finalizados}</span>
                <span className="ml-1.5">Finalizados</span>
              </Badge>
              <span className="text-[#F5C800] hidden sm:inline">•</span>
              <Badge variant="secondary" className="bg-red-600 text-white border-red-600 hover:bg-red-700 px-3 py-1.5 font-semibold text-sm">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>{metrics.emAndamento}</span>
                <span className="ml-1.5">Em Andamento</span>
              </Badge>
              {metrics.pendentes > 0 && (
                <>
                  <span className="text-[#F5C800] hidden sm:inline">•</span>
                  <Badge variant="secondary" className="bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 px-3 py-1.5 font-semibold text-sm">
                    <XCircle className="h-4 w-4 mr-1.5" />
                    <span>{metrics.pendentes}</span>
                    <span className="ml-1.5">Pendentes</span>
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Barra de busca e filtros - Layout simétrico */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch">
            {/* Campo de busca centralizado */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#F5C800] transition-colors" />
              <Input
                placeholder="Buscar por nome, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white border-[#F5C800]/30 text-gray-900 placeholder:text-gray-500 focus:border-[#F5C800] focus:ring-[#F5C800] focus:ring-2 rounded-lg shadow-sm transition-all text-sm sm:text-base"
              />
            </div>

            {/* Filtro e botão com mesma altura e largura */}
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 sm:!w-[240px] !h-10 sm:!h-12 px-3 sm:px-6 bg-white border-[#F5C800]/30 rounded-lg shadow-sm hover:border-[#F5C800] transition-colors whitespace-nowrap font-semibold text-[#1E1E1E] text-sm sm:text-base">
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
                      <div className="h-3 w-3 rounded-full bg-red-600" />
                      Em Andamento
                    </div>
                  </SelectItem>
                  <SelectItem value="PENDENTE">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#F5C800]" />
                      Pendente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Botão Novo Cliente */}
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:!w-[200px] !h-10 sm:!h-12 bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold shadow-lg hover:shadow-xl transition-all px-3 sm:px-6 rounded-lg whitespace-nowrap text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Novo Cliente</span>
                <span className="xs:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo - Tabela */}
      <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <ClientesTable clientes={filteredClientes} searchTerm="" />
          </CardContent>
        </Card>
      </div>

      {/* Modal para Novo Cliente */}
      <ClienteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
