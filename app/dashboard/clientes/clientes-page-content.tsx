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
      <div className="bg-[#1E1E1E] border-b-4 border-[#F5C800] shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Título e métricas */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight uppercase">
              Gestão de Clientes
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="secondary" className="bg-[#F5C800] text-[#1E1E1E] border-[#F5C800] hover:bg-[#F5C800]/90 px-3 py-1.5 font-bold">
                <span className="font-bold">{metrics.total}</span>
                <span className="ml-1">Cadastrados</span>
              </Badge>
              <span className="text-[#F5C800]">•</span>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-3 py-1.5 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                <span className="font-semibold">{metrics.finalizados}</span>
                <span className="ml-1">Finalizados</span>
              </Badge>
              <span className="text-[#F5C800]">•</span>
              <Badge variant="secondary" className="bg-[#F5C800]/20 text-[#F5C800] border-[#F5C800]/40 hover:bg-[#F5C800]/30 px-3 py-1.5 font-semibold">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span className="font-semibold">{metrics.emAndamento}</span>
                <span className="ml-1">Em Andamento</span>
              </Badge>
              {metrics.pendentes > 0 && (
                <>
                  <span className="text-[#F5C800]">•</span>
                  <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-700/70 px-3 py-1.5 font-semibold">
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    <span className="font-semibold">{metrics.pendentes}</span>
                    <span className="ml-1">Pendentes</span>
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Barra de busca e filtros - Layout simétrico */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            {/* Campo de busca centralizado */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#F5C800] transition-colors" />
              <Input
                placeholder=" Buscar por nome, código ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white border-[#F5C800]/30 text-gray-900 placeholder:text-gray-500 focus:border-[#F5C800] focus:ring-[#F5C800] focus:ring-2 rounded-lg shadow-sm transition-all"
              />
            </div>

            {/* Filtro e botão com mesma altura e largura */}
            <div className="flex gap-3 lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="!w-[200px] !h-12 px-6 bg-white border-[#F5C800]/30 rounded-lg shadow-sm hover:border-[#F5C800] transition-colors whitespace-nowrap font-semibold text-[#1E1E1E]">
                  <Filter className="h-5 w-5 mr-2 text-[#1E1E1E]" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="FINALIZADO">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Finalizado
                    </div>
                  </SelectItem>
                  <SelectItem value="EM ANDAMENTO">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-[#F5C800]" />
                      Em Andamento
                    </div>
                  </SelectItem>
                  <SelectItem value="PENDENTE">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                      Pendente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Botão Novo Cliente */}
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="!w-[200px] !h-12 bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold shadow-lg hover:shadow-xl transition-all px-6 rounded-lg whitespace-nowrap"
              >
                <Plus className="h-5 w-5 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo - Tabela */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <Card className="border-0 rounded-2xl shadow-lg overflow-hidden">
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
