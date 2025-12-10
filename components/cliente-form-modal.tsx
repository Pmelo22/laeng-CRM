"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useCEPAutofill } from "@/hooks/use-cep-autofill";
import { formatDateForInput } from "@/lib/utils";
import { getNextCode } from "@/lib/supabase-utils";
import { StatusSelectContent } from "@/lib/status-utils";

interface ClienteFormModalProps {
  cliente?: Cliente;
  isOpen: boolean;
  onClose: () => void;
  // Se true, é modo criação com obra; se false/undefined, é modo edição sem obra
  isCreateMode?: boolean;
}

export function ClienteFormModal({ 
  cliente, 
  isOpen, 
  onClose, 
  isCreateMode = false 
}: ClienteFormModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  
  // Usar hook para CEP
  const { 
    cep, 
    setCep, 
    loadingCep, 
    endereco, 
    setEndereco, 
    cidade, 
    setCidade, 
    estado, 
    setEstado, 
    handleCepChange 
  } = useCEPAutofill();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    cpf_cnpj: "",
    telefone: "",
    status: "PENDENTE" as "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE",
    data_contrato: formatDateForInput(null),
  });

  // Dados da obra (apenas para modo create)
  const [obraData, setObraData] = useState({
    endereco_obra: "",
    cidade_obra: "",
    estado_obra: "",
    local_obra: "",
    tipo_contrato: "PARTICULAR" as "PARTICULAR" | "PREFEITURA" | "CAIXA" | "FINANCIAMENTO" | "OUTRO",
    valor_terreno: 0,
    entrada: 0,
    valor_financiado: 0,
    subsidio: 0,
    valor_obra: 0,
    empreiteiro: 0,
    material: 0,
    terceirizado: 0,
    mao_de_obra: 0,
    empreiteiro_nome: "",
    empreiteiro_valor_pago: 0,
    pintor: 0,
    eletricista: 0,
    gesseiro: 0,
    azulejista: 0,
    manutencao: 0,
    responsavel: "",
    entidade: "",
    fase: "",
    ano_obra: new Date().getFullYear(),
    data_conclusao: "",
    observacoes_obra: "",
  });

  // Sincronizar dados quando modal abrir
  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        setFormData({
          nome: cliente.nome || "",
          cpf_cnpj: cliente.cpf_cnpj || "",
          telefone: cliente.telefone || "",
          status: cliente.status || "PENDENTE",
          data_contrato: formatDateForInput(cliente.data_contrato),
        });
        setEndereco(cliente.endereco || "");
        setCidade(cliente.cidade || "");
        setEstado(cliente.estado || "");
        setCep(cliente.cep || "");
      } else {
        setFormData({
          nome: "",
          cpf_cnpj: "",
          telefone: "",
          status: "PENDENTE",
          data_contrato: formatDateForInput(null),
        });
        setEndereco("");
        setCidade("");
        setEstado("");
        setCep("");
        setObraData({
          endereco_obra: "",
          cidade_obra: "",
          estado_obra: "",
          local_obra: "",
          tipo_contrato: "PARTICULAR",
          valor_terreno: 0,
          entrada: 0,
          valor_financiado: 0,
          subsidio: 0,
          valor_obra: 0,
          empreiteiro: 0,
          material: 0,
          terceirizado: 0,
          mao_de_obra: 0,
          empreiteiro_nome: "",
          empreiteiro_valor_pago: 0,
          pintor: 0,
          eletricista: 0,
          gesseiro: 0,
          azulejista: 0,
          manutencao: 0,
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
  }, [isOpen, cliente, setEndereco, setCidade, setEstado, setCep]);

  const handleFormFieldChange = useCallback((field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const baseData = {
        nome: formData.nome.trim() || "",
        cpf_cnpj: formData.cpf_cnpj?.trim() || null,
        telefone: formData.telefone?.trim() || null,
        status: formData.status,
        endereco: endereco?.trim() || "",
        cidade: cidade?.trim() || null,
        estado: estado?.trim() || null,
        cep: cep?.trim() || null,
        data_contrato: formData.data_contrato,
      };

      if (cliente) {
        // Atualizar cliente existente
        const { error } = await supabase
          .from("clientes")
          .update({ ...baseData, updated_at: new Date().toISOString() })
          .eq("id", cliente.id);

        if (error) throw error;

        // ✅ SINCRONIZAR: Atualizar todas as obras associadas com o novo status
        const { error: obraError } = await supabase
          .from("obras")
          .update({ 
            status: formData.status,
            updated_at: new Date().toISOString() 
          })
          .eq("cliente_id", cliente.id);

        if (obraError) {
          console.warn("Aviso ao sincronizar obras:", obraError);
          // Não falhar, apenas avisar
        }

        toast({
          title: "✅ Cliente atualizado!",
          description: `Os dados de ${formData.nome} foram atualizados com sucesso.`,
          duration: 3000,
        });
      } else if (isCreateMode) {
        // Criar novo cliente com obra
        const novoCodigoCliente = await getNextCode(supabase, "clientes");

        const dataToSave = {
          ...baseData,
          codigo: novoCodigoCliente,
        };

        const { data: clienteCriado, error } = await supabase
          .from("clientes")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;

        // Criar obra associada
        const novoCodigoObra = novoCodigoCliente;
        const valorContratual = (obraData.entrada || 0) + (obraData.valor_financiado || 0) + (obraData.subsidio || 0);

        const obraToSave = {
          codigo: novoCodigoObra,
          cliente_id: clienteCriado.id,
          endereco: obraData.endereco_obra || endereco || "Não informado",
          endereco_obra: obraData.endereco_obra || endereco || "Não informado",
          cidade_obra: obraData.cidade_obra || cidade || "Não informado",
          estado_obra: obraData.estado_obra || estado || "NA",
          local_obra: obraData.local_obra || null,
          tipo_contrato: obraData.tipo_contrato || "PARTICULAR",
          status: formData.status,
          valor_terreno: obraData.valor_terreno || 0,
          entrada: obraData.entrada || 0,
          valor_financiado: obraData.valor_financiado || 0,
          subsidio: obraData.subsidio || 0,
          valor_total: valorContratual,
          valor_obra: obraData.valor_obra || 0,
          empreiteiro: obraData.empreiteiro || 0,
          material: obraData.material || 0,
          terceirizado: obraData.terceirizado || 0,
          mao_de_obra: obraData.mao_de_obra || 0,
          empreiteiro_nome: obraData.empreiteiro_nome || null,
          empreiteiro_valor_pago: obraData.empreiteiro_valor_pago || 0,
          empreiteiro_saldo: (obraData.empreiteiro || 0) - (obraData.empreiteiro_valor_pago || 0),
          empreiteiro_percentual: obraData.empreiteiro > 0 ? ((obraData.empreiteiro_valor_pago || 0) / obraData.empreiteiro) * 100 : 0,
          pintor: obraData.pintor || 0,
          eletricista: obraData.eletricista || 0,
          gesseiro: obraData.gesseiro || 0,
          azulejista: obraData.azulejista || 0,
          manutencao: obraData.manutencao || 0,
          responsavel: obraData.responsavel || "Não informado",
          entidade: obraData.entidade || null,
          fase: obraData.fase || null,
          ano_obra: obraData.ano_obra || new Date().getFullYear(),
          data_conclusao: obraData.data_conclusao || null,
          medicao_01: 0,
          medicao_02: 0,
          medicao_03: 0,
          medicao_04: 0,
          medicao_05: 0,
        };

        const { error: obraError } = await supabase.from("obras").insert([obraToSave]).select().single();

        if (obraError) throw new Error(`Erro ao criar obra: ${obraError.message}`);

        toast({
          title: "✅ Cliente cadastrado!",
          description: `${formData.nome} foi cadastrado com sucesso.`,
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
  }, [formData, obraData, cliente, isCreateMode, supabase, router, onClose, toast, endereco, cidade, estado, cep]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  }, [isLoading, onClose]);

  const isEditMode = !!cliente;
  const showTitle = isEditMode ? "Editar Cliente" : "Novo Cliente";
  const showDescription = isEditMode 
    ? "Atualize as informações do cliente abaixo." 
    : "Preencha os dados do novo cliente.";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {showTitle}
          </DialogTitle>
          <DialogDescription>
            {showDescription}
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
                onChange={(e) => handleFormFieldChange('nome', e.target.value)}
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
                  onChange={(e) => handleFormFieldChange('cpf_cnpj', e.target.value)}
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
                  onChange={(e) => handleFormFieldChange('telefone', e.target.value)}
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
                  onValueChange={(value) => handleFormFieldChange('status', value)}
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
                  onChange={(e) => handleFormFieldChange('data_contrato', e.target.value)}
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
                value={cep}
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
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
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
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
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
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  placeholder="UF"
                  maxLength={2}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800]"
                />
              </div>
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
                isEditMode ? "Atualizar Cliente" : "Cadastrar Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
