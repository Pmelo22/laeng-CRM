"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Edit2 } from "lucide-react";

interface Permissao {
  id: string;
  nome: string;
  descricao: string;
}

interface Usuario {
  id: string;
  login: string;
  email: string;
  nome_completo: string;
  cargo: string;
  ativo: boolean;
}

interface EditarUsuarioModalProps {
  usuario: Usuario;
  permissoes: Permissao[];
  onSuccess?: () => void;
}

export function EditarUsuarioModal({
  usuario,
  permissoes,
  onSuccess,
}: EditarUsuarioModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cargo, setCargo] = useState(usuario.cargo);
  const [ativo, setAtivo] = useState(usuario.ativo);
  const [permissoesSelect, setPermissoesSelect] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: usuario.email,
    nome_completo: usuario.nome_completo,
    senha: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: Record<string, unknown> = {
        usuarioId: usuario.id,
        email: formData.email,
        nome_completo: formData.nome_completo,
        cargo,
        ativo,
      };

      if (formData.senha) {
        updateData.senha = formData.senha;
      }

      if (usuario.cargo === "funcionario" || cargo === "funcionario") {
        updateData.permissoes = permissoesSelect;
      }

      const res = await fetch("/api/admin/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao atualizar usuário");
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });

      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (erro) {
      toast({
        title: "Erro",
        description: erro instanceof Error ? erro.message : "Erro ao atualizar usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermissao = (permissaoId: string) => {
    setPermissoesSelect((prev) =>
      prev.includes(permissaoId)
        ? prev.filter((id) => id !== permissaoId)
        : [...prev, permissaoId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full">
          <Edit2 className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário - {usuario.login}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Login</Label>
            <Input value={usuario.login} disabled className="border-slate-200" />
          </div>

          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={formData.nome_completo}
              onChange={(e) =>
                setFormData({ ...formData, nome_completo: e.target.value })
              }
              disabled={isLoading}
              className="border-slate-200"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
              className="border-slate-200"
            />
          </div>

          <div>
            <Label htmlFor="senha">Nova Senha (deixe em branco para não alterar)</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Deixe vazio para manter a atual"
              value={formData.senha}
              onChange={(e) =>
                setFormData({ ...formData, senha: e.target.value })
              }
              disabled={isLoading}
              className="border-slate-200"
            />
          </div>

          <div>
            <Label htmlFor="cargo">Cargo</Label>
            <Select value={cargo} onValueChange={setCargo} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="funcionario">Funcionário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              disabled={isLoading}
              className="rounded"
            />
            <Label htmlFor="ativo" className="font-normal cursor-pointer">
              Usuário Ativo
            </Label>
          </div>

          {cargo === "funcionario" && (
            <div>
              <Label>Permissões</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {permissoes.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-start gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={permissoesSelect.includes(perm.id)}
                      onChange={() => togglePermissao(perm.id)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{perm.nome}</p>
                      <p className="text-xs text-gray-500">{perm.descricao}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#F5C800] hover:bg-yellow-500 text-black font-semibold"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
