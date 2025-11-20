"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Cliente } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buscarCepViaCep } from "@/lib/utils";
import { getNextCode } from "@/lib/supabase-utils";
import { StatusSelectContent } from "@/lib/status-utils";

interface ClienteModalProps {
  cliente?: Cliente;
  isOpen: boolean;
  onClose: () => void;
}

export function ClienteModal({ cliente, isOpen, onClose }: ClienteModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Dados da obra
  const [obraData, setObraData] = useState({
    endereco_obra: "",
    cidade_obra: "",
    estado_obra: "",
    local_obra: "",
    tipo_contrato: "PARTICULAR" as "PARTICULAR" | "PREFEITURA" | "CAIXA" | "FINANCIAMENTO" | "OUTRO",
    // Valores financeiros
    valor_terreno: 0,
    entrada: 0,
    valor_financiado: 0,
    subsidio: 0,
    valor_obra: 0,
    // Custos principais
    empreiteiro: 0,
    material: 0,
    terceirizado: 0,
    mao_de_obra: 0,
    // Dados do empreiteiro
    empreiteiro_nome: "",
    empreiteiro_valor_pago: 0,
    // Terceirizados especializados
    pintor: 0,
    eletricista: 0,
    gesseiro: 0,
    azulejista: 0,
    manutencao: 0,
    // Outros dados
    responsavel: "",
    entidade: "",
    fase: "",
    ano_obra: new Date().getFullYear(),
    data_conclusao: "",
    observacoes_obra: "",
  });

  const [loadingCep, setLoadingCep] = useState(false);

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

  // Atualizar formData quando o modal abrir ou o cliente mudar
  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        // Modal de edição - preencher com dados do cliente
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
      } else {
        // Modal de criação - resetar para valores padrão
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
        setObraData({
          endereco_obra: "",
          cidade_obra: "",
          estado_obra: "",
          local_obra: "",
          tipo_contrato: "PARTICULAR",
          // Valores financeiros
          valor_terreno: 0,
          entrada: 0,
          valor_financiado: 0,
          subsidio: 0,
          valor_obra: 0,
          // Custos principais
          empreiteiro: 0,
          material: 0,
          terceirizado: 0,
          mao_de_obra: 0,
          // Dados do empreiteiro
          empreiteiro_nome: "",
          empreiteiro_valor_pago: 0,
          // Terceirizados especializados
          pintor: 0,
          eletricista: 0,
          gesseiro: 0,
          azulejista: 0,
          manutencao: 0,
          // Outros dados
          responsavel: "",
          entidade: "",
          fase: "",
          ano_obra: new Date().getFullYear(),
          data_conclusao: "",
          observacoes_obra: "",
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
      // Preparar dados base para envio - APENAS campos que existem na tabela clientes
      // Os valores financeiros são agregados das obras, não são salvos diretamente no cliente
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
        // Atualizar cliente existente - não precisa do código
        const { error } = await supabase
          .from("clientes")
          .update({ ...baseData, updated_at: new Date().toISOString() })
          .eq("id", cliente.id);

        if (error) {
          console.error("Erro ao atualizar cliente:", error);
          throw error;
        }

        // Sucesso - mostrar toast
        toast({
          title: "✅ Cliente atualizado!",
          description: `Os dados de ${formData.nome} foram atualizados com sucesso.`,
          duration: 3000,
        });
      } else {
        // Criar novo cliente - gerar código sequencial
        const novoCodigoCliente = await getNextCode(supabase, "clientes");

        // Adicionar código aos dados
        const dataToSave = {
          ...baseData,
          codigo: novoCodigoCliente,
        };

        const { data: clienteCriado, error } = await supabase
          .from("clientes")
          .insert([dataToSave])
          .select()
          .single();

        if (error) {
          console.error("Erro ao criar cliente:", error);
          throw error;
        }

        // SEMPRE criar uma obra associada ao cliente (mesmo que com dados incompletos)
        // IMPORTANTE: Usar o MESMO código do cliente para manter consistência
        const novoCodigoObra = novoCodigoCliente;

        // valor_total é calculado automaticamente pelo trigger do banco
        const valorContratual = (obraData.entrada || 0) + (obraData.valor_financiado || 0) + (obraData.subsidio || 0);

        const obraToSave = {
          codigo: novoCodigoObra,
          cliente_id: clienteCriado.id,
          endereco: obraData.endereco_obra || formData.endereco || "Não informado",
          endereco_obra: obraData.endereco_obra || formData.endereco || "Não informado",
          cidade_obra: obraData.cidade_obra || formData.cidade || "Não informado",
          estado_obra: obraData.estado_obra || formData.estado || "NA",
          local_obra: obraData.local_obra || null,
          tipo_contrato: obraData.tipo_contrato || "PARTICULAR",
          status: formData.status, // Usar o MESMO status do cliente
          // Valores financeiros
          valor_terreno: obraData.valor_terreno || 0,
          entrada: obraData.entrada || 0,
          valor_financiado: obraData.valor_financiado || 0,
          subsidio: obraData.subsidio || 0,
          valor_total: valorContratual,
          valor_obra: obraData.valor_obra || 0,
          // Custos principais
          empreiteiro: obraData.empreiteiro || 0,
          material: obraData.material || 0,
          terceirizado: obraData.terceirizado || 0,
          mao_de_obra: obraData.mao_de_obra || 0,
          // Dados do empreiteiro
          empreiteiro_nome: obraData.empreiteiro_nome || null,
          empreiteiro_valor_pago: obraData.empreiteiro_valor_pago || 0,
          empreiteiro_saldo: (obraData.empreiteiro || 0) - (obraData.empreiteiro_valor_pago || 0),
          empreiteiro_percentual: obraData.empreiteiro > 0 ? ((obraData.empreiteiro_valor_pago || 0) / obraData.empreiteiro) * 100 : 0,
          // Terceirizados especializados
          pintor: obraData.pintor || 0,
          eletricista: obraData.eletricista || 0,
          gesseiro: obraData.gesseiro || 0,
          azulejista: obraData.azulejista || 0,
          manutencao: obraData.manutencao || 0,
          // Outros dados
          responsavel: obraData.responsavel || "Não informado",
          entidade: obraData.entidade || null,
          fase: obraData.fase || null,
          ano_obra: obraData.ano_obra || new Date().getFullYear(),
          data_conclusao: obraData.data_conclusao || null,
          // Inicializar medições com 0
          medicao_01: 0,
          medicao_02: 0,
          medicao_03: 0,
          medicao_04: 0,
          medicao_05: 0,
        };

        const { error: obraError } = await supabase.from("obras").insert([obraToSave]).select().single();

        // Se houver erro ao criar a obra, lançar erro detalhado
        if (obraError) {
          throw new Error(`Erro ao criar obra: ${obraError.message}`);
        }

        // Sucesso - mostrar toast
        toast({
          title: "✅ Cliente cadastrado!",
          description: `${formData.nome} foi cadastrado com sucesso.`,
          duration: 3000,
        });
      }

      // APENAS SE CHEGOU AQUI (sem erro) - Fechar modal e recarregar
      setIsLoading(false);
      onClose();
      
      // Aguardar um momento para garantir que o Supabase processou
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Forçar refresh da página para recarregar os dados do servidor
      router.refresh();
    } catch (error: unknown) {
      // Erro - manter modal aberto e mostrar mensagem
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar cliente";
      
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: "❌ Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      // NÃO fechar o modal - usuário pode corrigir os dados
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
                <StatusSelectContent />
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_contrato" className="text-sm font-semibold">
                DATA *
              </Label>
              <Input
                id="data_contrato"
                type="date"
                required
                value={formData.data_contrato}
                onChange={(e) => setFormData({ ...formData, data_contrato: e.target.value })}
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
              Endereço
            </Label>
            <Input
              id="endereco"
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
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                placeholder="UF"
                maxLength={2}
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* Separador de Seção - Dados da Obra - APENAS PARA NOVO CLIENTE */}
          {!cliente && (
            <>
          </>
          )}

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
