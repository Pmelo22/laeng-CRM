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
import { Plus } from "lucide-react";

interface Permissao {
  id: string;
  nome: string;
  descricao: string;
}

interface NovoUsuarioModalProps {
  permissoes: Permissao[];
  onSuccess?: () => void;
}

export function NovoUsuarioModal({ permissoes, onSuccess }: NovoUsuarioModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cargo, setCargo] = useState("funcionario");
  const [permissoesSelect, setPermissoesSelect] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    login: "",
    senha: "",
    email: "",
    nome_completo: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cargo,
          permissoes: cargo === "funcionario" ? permissoesSelect : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao criar usuário");
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${formData.login} criado com sucesso`,
      });

      setFormData({ login: "", senha: "", email: "", nome_completo: "" });
      setCargo("funcionario");
      setPermissoesSelect([]);
      setOpen(false);
      
      router.refresh();
      onSuccess?.();
    } catch (erro) {
      toast({
        title: "Erro",
        description: erro instanceof Error ? erro.message : "Erro ao criar usuário",
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
        <Button className="w-full bg-[#F5C800] hover:bg-yellow-500 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login">Login *</Label>
            <Input
              id="login"
              placeholder="ex: joao.silva"
              value={formData.login}
              onChange={(e) =>
                setFormData({ ...formData, login: e.target.value })
              }
              required
              disabled={isLoading}
              className="border-slate-200"
            />
          </div>

          <div>
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.senha}
              onChange={(e) =>
                setFormData({ ...formData, senha: e.target.value })
              }
              required
              disabled={isLoading}
              className="border-slate-200"
            />
          </div>

          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              placeholder="João Silva"
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
              placeholder="joao@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
              className="border-slate-200"
            />
          </div>

          <div>
            <Label htmlFor="cargo">Cargo *</Label>
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
              {isLoading ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
