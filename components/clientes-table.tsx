"use client"

import type { Cliente } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    const { error } = await supabase.from("clientes").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir cliente: " + error.message)
    } else {
      router.refresh()
    }
  }

  if (clientes.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum cliente cadastrado ainda.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF/CNPJ</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.cpf_cnpj || "-"}</TableCell>
              <TableCell>{cliente.telefone || "-"}</TableCell>
              <TableCell>{cliente.email || "-"}</TableCell>
              <TableCell>{cliente.cidade || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/clientes/${cliente.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cliente.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
