"use client"

import { useMemo } from "react"
import type { Usuario } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Shield, User as UserIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { usePagination } from "@/lib/table-utils"

interface UsuariosTableProps {
  usuarios: Usuario[]
  searchTerm?: string
  onEdit: (usuario: Usuario) => void
  onDelete: (usuario: Usuario) => void
  isRefreshing?: boolean
}

export function UsuariosTable({ 
  usuarios, 
  searchTerm = "", 
  onEdit, 
  onDelete,
  isRefreshing = false 
}: UsuariosTableProps) {
  
  // Filtrar usuários pela busca
  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios
    
    const term = searchTerm.toLowerCase()
    return usuarios.filter(usuario => 
      usuario.nome_completo?.toLowerCase().includes(term) ||
      usuario.login?.toLowerCase().includes(term)
    )
  }, [usuarios, searchTerm])

  // Paginação
  const { 
    paginatedData: paginatedUsuarios 
  } = usePagination(filteredUsuarios, 20)

  const getCargoBadge = (cargo: 'admin' | 'funcionario') => {
    if (cargo === 'admin') {
      return (
        <Badge className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs">
          <Shield className="h-3 w-3 mr-1" />
          ADMIN
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-600 text-white hover:bg-gray-700 font-bold text-xs">
        <UserIcon className="h-3 w-3 mr-1" />
        FUNCIONÁRIO
      </Badge>
    )
  }

  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">Nenhum usuário cadastrado ainda.</p>
        <p className="text-sm text-muted-foreground mt-2">Os usuários aparecerão aqui quando o backend estiver conectado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
              <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                <TableHead className="text-[#F5C800] font-bold py-3 flex-1">
                  LOGIN
                </TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 flex-1">
                NOME COMPLETO
                </TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 flex-1 text-center">
                  CARGO
                </TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 flex-1 text-center">
                  ÚLTIMO ACESSO
                </TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 flex-1 text-center">
                  AÇÕES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRefreshing && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F5C800]"></div>
                      <span>Atualizando dados...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isRefreshing && paginatedUsuarios.map((usuario) => (
                <TableRow key={usuario.id} className="hover:bg-[#F5C800]/5 border-b">
                  <TableCell className="font-medium py-3 flex-1">
                    <span className="font-semibold text-sm">{usuario.login}</span>
                  </TableCell>
                  <TableCell className="font-medium py-3 flex-1">
                  <span className="text-sm">{usuario.nome_completo}</span>
                  </TableCell>
                  <TableCell className="py-3 flex-1 text-center">
                    {getCargoBadge(usuario.cargo)}
                  </TableCell>
                  <TableCell className="py-3 flex-1 text-center">
                    <span className="text-sm">
                      {usuario.ultimo_acesso ? formatDate(usuario.ultimo_acesso) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 flex-1">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => onEdit(usuario)}
                        className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0 transition-colors"
                        title="Editar Usuário"
                      >
                        <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(usuario)}
                        className="border-2 border-red-300 hover:border-red-500 hover:bg-red-50 h-9 w-9 p-0 transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
