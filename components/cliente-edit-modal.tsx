"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, User } from "lucide-react";
import type { Cliente, Obra } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { buscarCepViaCep } from "@/lib/utils";
import { StatusSelectContent } from "@/lib/status-utils";

interface ClienteEditModalProps {
  cliente?: Cliente;
  isOpen: boolean;
  onClose: () => void;
}

export function ClienteEditModal({ cliente, isOpen, onClose }: ClienteEditModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [, setObras] = useState<Obra[]>([]);

  // Dados do cliente
  const [formData, setFormData] = useState({
    nome: "",
    cpf_cnpj: "",
    telefone: "",
    status: "PENDENTE" as "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    data_contrato: new Date().toISOString().split('T')[0],
  });

  // Dados das obras do cliente (para edição)
  const [obrasData, setObrasData] = useState<Record<string, {
    // Custos principais
    empreiteiro: number;
    material: number;
    // Demonstrativo empreiteiro
    empreiteiro_nome: string;
    empreiteiro_valor_pago: number;
    // Terceirizados
    pintor: number;
    eletricista: number;
    gesseiro: number;
    azulejista: number;
    manutencao: number;
    // Valores financeiros
    valor_terreno: number;
    entrada: number;
    subsidio: number;
    valor_financiado: number;
    valor_obra: number;
  }>>({});

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (isOpen && cliente) {
      setFormData({
        nome: cliente.nome || "",
        cpf_cnpj: cliente.cpf_cnpj || "",
        telefone: cliente.telefone || "",
        status: cliente.status || "PENDENTE",
        endereco: cliente.endereco || "",
        cidade: cliente.cidade || "",
        estado: cliente.estado || "",
        cep: cliente.cep || "",
        data_contrato: cliente.data_contrato || new Date().toISOString().split('T')[0],
      });
      buscarObras();
    } else if (isOpen && !cliente) {
      // Resetar form para novo cliente
      setFormData({
        nome: "",
        cpf_cnpj: "",
        telefone: "",
        status: "PENDENTE",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        data_contrato: new Date().toISOString().split('T')[0],
      });
      setObras([]);
      setObrasData({});
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cliente]);

  const buscarObras = async () => {
    if (!cliente) return;
    
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .eq("cliente_id", cliente.id);

      if (error) throw error;

      const obrasFormatadas = (data || []) as Obra[];
      setObras(obrasFormatadas);
      
      // Inicializar obrasData com os valores das obras
      const initialObrasData: Record<string, {
        empreiteiro: number;
        material: number;
        terceirizado: number;
        mao_de_obra: number;
        empreiteiro_nome: string;
        empreiteiro_valor_pago: number;
        pintor: number;
        eletricista: number;
        gesseiro: number;
        azulejista: number;
        manutencao: number;
        valor_terreno: number;
        entrada: number;
        subsidio: number;
        valor_financiado: number;
        valor_obra: number;
      }> = {};
      obrasFormatadas.forEach((obra) => {
        initialObrasData[obra.id] = {
          // Custos principais
          empreiteiro: Number(obra.empreiteiro) || 0,
          material: Number(obra.material) || 0,
          terceirizado: Number(obra.terceirizado) || 0,
          mao_de_obra: Number(obra.mao_de_obra) || 0,
          // Demonstrativo empreiteiro
          empreiteiro_nome: obra.empreiteiro_nome || "",
          empreiteiro_valor_pago: Number(obra.empreiteiro_valor_pago) || 0,
          // Terceirizados especializados
          pintor: Number(obra.pintor) || 0,
          eletricista: Number(obra.eletricista) || 0,
          gesseiro: Number(obra.gesseiro) || 0,
          azulejista: Number(obra.azulejista) || 0,
          manutencao: Number(obra.manutencao) || 0,
          // Valores financeiros
          valor_terreno: Number(obra.valor_terreno) || 0,
          entrada: Number(obra.entrada) || 0,
          subsidio: Number(obra.subsidio) || 0,
          valor_financiado: Number(obra.valor_financiado) || 0,
          valor_obra: Number(obra.valor_obra) || 0,
        };
      });
      setObrasData(initialObrasData);
    } catch (error) {
      // Erro ao buscar obras - usar array vazio
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value;
    setFormData({ ...formData, cep: newCep });
    
    const cepLimpo = newCep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      const data = await buscarCepViaCep(newCep);
      if (data && !data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: prev.endereco || data.logradouro || "",
          cidade: prev.cidade || data.localidade || "",
          estado: prev.estado || data.uf || "",
        }));
      }
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Preparar dados base do cliente
      const baseData = {
        nome: formData.nome.trim() || "",
        cpf_cnpj: formData.cpf_cnpj?.trim() || null,
        telefone: formData.telefone?.trim() || null,
        status: formData.status,
        endereco: formData.endereco?.trim() || "",
        cidade: formData.cidade?.trim() || null,
        estado: formData.estado?.trim() || null,
        cep: formData.cep?.trim() || null,
        data_contrato: formData.data_contrato,
      };

      if (cliente) {
        // Atualizar cliente existente
        const { error: clienteError } = await supabase
          .from("clientes")
          .update({ ...baseData, updated_at: new Date().toISOString() })
          .eq("id", cliente.id);

        if (clienteError) throw clienteError;

        // Atualizar todas as obras do cliente
        for (const obraId of Object.keys(obrasData)) {
          const obraValues = obrasData[obraId];
          
          // valor_total é calculado automaticamente pelo trigger do banco
          
          const empreiteiro_saldo = obraValues.empreiteiro - obraValues.empreiteiro_valor_pago;
          const empreiteiro_percentual = obraValues.empreiteiro > 0 
            ? (obraValues.empreiteiro_valor_pago / obraValues.empreiteiro) * 100 
            : 0;

          const { error: obraError } = await supabase
            .from("obras")
            .update({
              // SINCRONIZAÇÃO: Incluir o status do cliente
              status: formData.status,
              // Custos
              empreiteiro: obraValues.empreiteiro,
              material: obraValues.material,
              empreiteiro_nome: obraValues.empreiteiro_nome,
              empreiteiro_valor_pago: obraValues.empreiteiro_valor_pago,
              empreiteiro_saldo: empreiteiro_saldo,
              empreiteiro_percentual: empreiteiro_percentual,
              pintor: obraValues.pintor,
              eletricista: obraValues.eletricista,
              gesseiro: obraValues.gesseiro,
              azulejista: obraValues.azulejista,
              manutencao: obraValues.manutencao,
              // Valores financeiros
              valor_terreno: obraValues.valor_terreno,
              entrada: obraValues.entrada,
              subsidio: obraValues.subsidio,
              valor_financiado: obraValues.valor_financiado,
              valor_obra: obraValues.valor_obra,
              updated_at: new Date().toISOString()
            })
            .eq("id", obraId);

          if (obraError) {
            throw obraError;
          }
        }

        toast({
          title: "✅ Cliente atualizado!",
          description: `Os dados de ${formData.nome} foram atualizados e sincronizados.`,
          duration: 3000,
        });
      }

      setIsLoading(false);
      onClose();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar cliente";
      
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: "❌ Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {cliente ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {cliente 
              ? "Atualize as informações do cliente e suas obras abaixo."
              : "Preencha os dados do novo cliente."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin pr-4 flex-1">
          {/* ==================== INFORMAÇÕES DO CLIENTE ==================== */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-[#F5C800]" />
              <h3 className="text-base font-bold text-[#1E1E1E]">Informações do Cliente</h3>
            </div>

            <div className="space-y-4">
              {/* NOME | CPF | TELEFONE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="nome" className="text-sm font-medium">
                    Nome do Cliente *
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo"
                    required
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cpf_cnpj" className="text-sm font-medium">
                    CPF/CNPJ
                  </Label>
                  <Input
                    id="cpf_cnpj"
                    type="text"
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    placeholder="000.000.000-00"
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="telefone" className="text-sm font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>
              </div>

              {/* STATUS | DATA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE" })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="border-2 focus:border-[#F5C800]">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <StatusSelectContent />
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="data_contrato" className="text-sm font-medium">
                    Data *
                  </Label>
                  <Input
                    id="data_contrato"
                    type="date"
                    value={formData.data_contrato}
                    onChange={(e) => setFormData({ ...formData, data_contrato: e.target.value })}
                    required
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>
              </div>

              {/* CEP | ENDEREÇO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cep" className="text-sm font-medium">
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    type="text"
                    value={formData.cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    disabled={isLoading || loadingCep}
                    className="border-2 focus:border-[#F5C800]"
                  />
                  {loadingCep && <p className="text-xs text-gray-500">Buscando CEP...</p>}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="endereco" className="text-sm font-medium">
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, complemento"
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>
              </div>

              {/* CIDADE | ESTADO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cidade" className="text-sm font-medium">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Nome da cidade"
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="estado" className="text-sm font-medium">
                    Estado
                  </Label>
                  <Input
                    id="estado"
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    placeholder="UF"
                    maxLength={2}
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <p className="text-sm text-red-700 font-semibold">❌ {error}</p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 min-w-[120px]"
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
