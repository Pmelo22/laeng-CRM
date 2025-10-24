"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { ClientesTable } from "@/components/clientes-table"
import type { Cliente } from "@/lib/types"

interface ClientesPageContentProps {
  clientes: Cliente[]
}

export default function ClientesPageContent({ clientes }: ClientesPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header com identidade visual e barra de pesquisa */}
      <div className="bg-[#1E1E1E] border-b-4 border-[#F5C800]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Título à esquerda */}
            <div className="min-w-fit">
              <h1 className="text-3xl font-bold text-white">Lista de Clientes</h1>
              <p className="text-[#F5C800] font-medium text-sm">{clientes.length} cliente(s) cadastrado(s)</p>
            </div>

            {/* Barra de Pesquisa no centro */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#F5C800]" />
                <Input
                  placeholder="Pesquisar por código ou nome do cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/10 border-[#F5C800]/30 text-white placeholder:text-gray-400 focus:border-[#F5C800] focus:ring-[#F5C800] text-lg"
                />
              </div>
            </div>

            {/* Botão à direita */}
            <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold shadow-lg min-w-fit">
              <Link href="/dashboard/clientes/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <Card className="shadow-lg border-t-4 border-t-[#F5C800]">
          <CardContent className="pt-6">
            <ClientesTable clientes={clientes} searchTerm={searchTerm} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
