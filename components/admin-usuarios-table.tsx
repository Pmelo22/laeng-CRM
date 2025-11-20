"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NovoUsuarioModal } from "./novo-usuario-modal";
import { EditarUsuarioModal } from "./editar-usuario-modal";
import { DeleteUsuarioModal } from "./delete-usuario-modal";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle2, XCircle } from "lucide-react";

interface Usuario {
  id: string;
  login: string;
  email: string;
  nome_completo: string;
  cargo: string;
  ativo: boolean;
  criado_em: string;
  ultimo_acesso: string | null;
}

interface Permissao {
  id: string;
  nome: string;
  descricao: string;
  recurso: string;
  acao: string;
}

interface AdminUsuariosTableProps {
  usuarios: Usuario[];
  permissoes: Permissao[];
}

export function AdminUsuariosTable({
  usuarios: usuariosInit,
  permissoes,
}: AdminUsuariosTableProps) {
  const [usuarios, setUsuarios] = useState(usuariosInit);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (usuarioId: string) => {
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao deletar usuário");
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioId));
      toast({
        title: "Sucesso",
        description: "Usuário deletado com sucesso",
      });
    } catch (erro) {
      toast({
        title: "Erro",
        description: erro instanceof Error ? erro.message : "Erro ao deletar usuário",
        variant: "destructive",
      });
    } finally {
      setDeletandoId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <NovoUsuarioModal permissoes={permissoes} />
      </div>

      <div className="border-0 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700">
              <TableHead className="text-white font-semibold">Login</TableHead>
              <TableHead className="text-white font-semibold">Nome</TableHead>
              <TableHead className="text-white font-semibold">Email</TableHead>
              <TableHead className="text-white font-semibold">Cargo</TableHead>
              <TableHead className="text-white font-semibold">Status</TableHead>
              <TableHead className="text-right text-white font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500 bg-slate-50">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8 text-slate-300" />
                    <span>Nenhum usuário encontrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario, index) => (
                <TableRow 
                  key={usuario.id} 
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  } hover:bg-amber-50 transition-colors duration-200 border-b border-slate-200`}
                >
                  <TableCell className="font-semibold text-slate-900">{usuario.login}</TableCell>
                  <TableCell className="text-slate-700">{usuario.nome_completo}</TableCell>
                  <TableCell className="text-sm text-slate-600">{usuario.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        usuario.cargo === "admin"
                          ? "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200 font-semibold"
                          : "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 font-semibold"
                      }`}
                    >
                      {usuario.cargo === "admin" ? "👑 Admin" : "👤 Funcionário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {usuario.ativo ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <Badge className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200 font-semibold">
                            Ativo
                          </Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-slate-400" />
                          <Badge className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-800 border border-slate-200 font-semibold">
                            Inativo
                          </Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <EditarUsuarioModal
                      usuario={usuario}
                      permissoes={permissoes}
                    />
                    <DeleteUsuarioModal
                      usuario={usuario}
                      onConfirm={() => handleDelete(usuario.id)}
                      isLoading={deletandoId === usuario.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-lg border border-t-0 border-slate-200">
        <span className="text-sm font-medium text-slate-700">
          📊 Total de <span className="font-bold text-slate-900">{usuarios.length}</span> usuário{usuarios.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-slate-500">Última atualização: agora</span>
      </div>
    </div>
  );
}
