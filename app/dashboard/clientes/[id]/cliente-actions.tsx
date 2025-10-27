"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { Cliente } from "@/lib/types";

interface ClienteActionsProps {
  cliente: Cliente;
}

// ============================================
// MODAL DE EDIÇÃO
// ============================================
export function ClienteActions({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: cliente.nome || "",
    cpf_cnpj: cliente.cpf_cnpj || "",
    telefone: cliente.telefone || "",
    email: cliente.email || "",
    status: cliente.status || "PENDENTE",
    endereco: cliente.endereco || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
    cep: cliente.cep || "",
    responsavel_contato: cliente.responsavel_contato || "",
    observacoes: cliente.observacoes || "",
    data_cadastro: cliente.data_cadastro || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("clientes")
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq("id", cliente.id);

      if (error) throw error;

      router.refresh();
      setIsModalOpen(false);
    } catch (error: any) {
      setError(error.message || "Erro ao salvar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
      >
        <Edit className="mr-2 h-4 w-4" />
        Editar Cliente
      </Button>

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cliente *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* CPF/CNPJ e Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Status e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <span>PENDENTE</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EM ANDAMENTO">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span>EM ANDAMENTO</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="FINALIZADO">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span>FINALIZADO</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_cadastro">Data de Cadastro *</Label>
                <Input
                  id="data_cadastro"
                  type="date"
                  required
                  value={formData.data_cadastro}
                  onChange={(e) => setFormData({ ...formData, data_cadastro: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                required
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Cidade, Estado, CEP */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  maxLength={2}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="responsavel_contato">Responsável pelo Contato</Label>
              <Input
                id="responsavel_contato"
                value={formData.responsavel_contato}
                onChange={(e) => setFormData({ ...formData, responsavel_contato: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Atualizar Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// BADGE DE STATUS CLICÁVEL
// ============================================
export function ClienteStatusBadge({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);

    try {
      // Ciclo: PENDENTE -> EM ANDAMENTO -> FINALIZADO -> PENDENTE
      let newStatus: "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE";
      
      if (cliente.status === "PENDENTE") {
        newStatus = "EM ANDAMENTO";
      } else if (cliente.status === "EM ANDAMENTO") {
        newStatus = "FINALIZADO";
      } else {
        newStatus = "PENDENTE";
      }

      const { error } = await supabase
        .from("clientes")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq("id", cliente.id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = {
    "FINALIZADO": { 
      color: "bg-green-500 hover:bg-green-600 text-white", 
      icon: CheckCircle2,
      label: "Finalizado"
    },
    "EM ANDAMENTO": { 
      color: "bg-red-500 hover:bg-red-600 text-white", 
      icon: Clock,
      label: "Em Andamento"
    },
    "PENDENTE": { 
      color: "bg-yellow-500 hover:bg-yellow-600 text-white", 
      icon: AlertCircle,
      label: "Pendente"
    }
  };

  const config = statusConfig[cliente.status as keyof typeof statusConfig] || statusConfig["PENDENTE"];
  const Icon = config.icon;

  return (
    <Badge 
      className={`${config.color} font-semibold px-3 py-1.5 cursor-pointer transition-all border-0 ${isUpdating ? 'opacity-50' : ''}`}
      onClick={handleClick}
      title="Clique para alterar o status"
    >
      {isUpdating ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Atualizando...
        </>
      ) : (
        <>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </>
      )}
    </Badge>
  );
}

