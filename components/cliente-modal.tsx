"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Cliente } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ClienteModalProps {
  cliente?: Cliente;
  isOpen: boolean;
  onClose: () => void;
}

export function ClienteModal({ cliente, isOpen, onClose }: ClienteModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    cpf_cnpj: "",
    telefone: "",
    email: "",
    status: "PENDENTE" as "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    responsavel_contato: "",
    observacoes: "",
    data_cadastro: new Date().toISOString().split('T')[0],
  });

  const [loadingCep, setLoadingCep] = useState(false);

  // Função para buscar endereço pelo CEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: prev.endereco || data.logradouro || "",
          cidade: prev.cidade || data.localidade || "",
          estado: prev.estado || data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value;
    setFormData({ ...formData, cep: newCep });
    
    const cepLimpo = newCep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCep(newCep);
    }
  };

  // Atualizar formData quando o modal abrir ou o cliente mudar
  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        // Modal de edição - preencher com dados do cliente
        setFormData({
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
      } else {
        // Modal de criação - resetar para valores padrão
        setFormData({
          nome: "",
          cpf_cnpj: "",
          telefone: "",
          email: "",
          status: "PENDENTE",
          endereco: "",
          cidade: "",
          estado: "",
          cep: "",
          responsavel_contato: "",
          observacoes: "",
          data_cadastro: new Date().toISOString().split('T')[0],
        });
      }
      setError(null);
    }
  }, [isOpen, cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (cliente) {
        // Atualizar cliente existente
        const { error } = await supabase
          .from("clientes")
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq("id", cliente.id);

        if (error) throw error;
      } else {
        // Criar novo cliente
        const { error } = await supabase.from("clientes").insert([formData]);

        if (error) throw error;
      }

      router.refresh();
      onClose();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {cliente ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {cliente 
              ? "Atualize as informações do cliente abaixo." 
              : "Preencha os dados do novo cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin pr-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-semibold">
              Nome do Cliente *
            </Label>
            <Input
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite o nome do cliente"
              disabled={isLoading}
              className="border-2 focus:border-[#F5C800]"
            />
          </div>

          {/* CPF/CNPJ e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj" className="text-sm font-semibold">
                CPF/CNPJ
              </Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                placeholder="000.000.000-00"
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-sm font-semibold">
                Telefone
              </Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="cliente@email.com"
              disabled={isLoading}
              className="border-2 focus:border-[#F5C800]"
            />
          </div>

          {/* Status e Data de Cadastro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">
                Status *
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE" })}
                disabled={isLoading}
              >
                <SelectTrigger className="border-2 focus:ring-[#F5C800] w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>PENDENTE</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="EM ANDAMENTO">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>EM ANDAMENTO</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="FINALIZADO">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>FINALIZADO</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_cadastro" className="text-sm font-semibold">
                Data de Cadastro *
              </Label>
              <Input
                id="data_cadastro"
                type="date"
                required
                value={formData.data_cadastro}
                onChange={(e) => setFormData({ ...formData, data_cadastro: e.target.value })}
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep" className="text-sm font-semibold">
              CEP
            </Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              maxLength={9}
              disabled={isLoading}
              className="border-2 focus:border-[#F5C800]"
            />
            {loadingCep && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco" className="text-sm font-semibold">
              Endereço *
            </Label>
            <Input
              id="endereco"
              required
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Rua, número, bairro"
              disabled={isLoading}
              className="border-2 focus:border-[#F5C800]"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade" className="text-sm font-semibold">
                Cidade
              </Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="Cidade"
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-sm font-semibold">
                Estado
              </Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                placeholder="UF"
                maxLength={2}
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* Responsável pelo Contato */}
          <div className="space-y-2">
            <Label htmlFor="responsavel_contato" className="text-sm font-semibold">
              Responsável pelo Contato
            </Label>
            <Input
              id="responsavel_contato"
              value={formData.responsavel_contato}
              onChange={(e) => setFormData({ ...formData, responsavel_contato: e.target.value })}
              placeholder="Ex: LA, DERLANE, ANINHA"
              disabled={isLoading}
              className="border-2 focus:border-[#F5C800]"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-semibold">
              Observações
            </Label>
            <textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre o cliente"
              disabled={isLoading}
              rows={3}
              className="w-full border-2 focus:border-[#F5C800] rounded-md px-3 py-2 text-sm resize-none"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-md">
              {error}
            </div>
          )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-2"
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
                cliente ? "Atualizar Cliente" : "Cadastrar Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
