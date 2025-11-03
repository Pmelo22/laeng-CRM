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
import { Loader2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  // Dados da obra
  const [obraData, setObraData] = useState({
    endereco_obra: "",
    valor_terreno: 0,
    entrada: 0,
    valor_financiado: 0,
    subsidio: 0,
    empreiteiro_nome: "",
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
        setObraData({
          endereco_obra: "",
          valor_terreno: 0,
          entrada: 0,
          valor_financiado: 0,
          subsidio: 0,
          empreiteiro_nome: "",
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
        email: formData.email?.trim() || null,
        status: formData.status,
        endereco: formData.endereco?.trim() || "",
        cidade: formData.cidade?.trim() || null,
        estado: formData.estado?.trim() || null,
        cep: formData.cep?.trim() || null,
        responsavel_contato: formData.responsavel_contato?.trim() || null,
        observacoes: formData.observacoes?.trim() || null,
        data_cadastro: formData.data_cadastro,
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
        // Criar novo cliente - precisa gerar o código
        // Buscar o último código usado
        const { data: ultimoCliente, error: erroConsulta } = await supabase
          .from("clientes")
          .select("codigo")
          .order("codigo", { ascending: false })
          .limit(1)
          .single();

        if (erroConsulta && erroConsulta.code !== 'PGRST116') {
          // PGRST116 = nenhum registro encontrado (primeira inserção)
          console.error("Erro ao buscar último código:", erroConsulta);
          throw erroConsulta;
        }

        // Gerar novo código do cliente
        const novoCodigoCliente = ultimoCliente ? ultimoCliente.codigo + 1 : 1;

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

        // Criar a obra associada ao cliente
        // Buscar o último código de obra
        const { data: ultimaObra, error: erroConsultaObra } = await supabase
          .from("obras")
          .select("codigo")
          .order("codigo", { ascending: false })
          .limit(1)
          .single();

        if (erroConsultaObra && erroConsultaObra.code !== 'PGRST116') {
          console.error("Erro ao buscar último código de obra:", erroConsultaObra);
          throw erroConsultaObra;
        }

        const novoCodigoObra = ultimaObra ? ultimaObra.codigo + 1 : 1;

        // Calcular valor contratual = entrada + financiado + subsidio (SEM terreno)
        const valorContratual = 
          (obraData.entrada || 0) + 
          (obraData.valor_financiado || 0) + 
          (obraData.subsidio || 0);

        const obraToSave = {
          codigo: novoCodigoObra,
          cliente_id: clienteCriado.id,
          cliente_nome: formData.nome,
          endereco: obraData.endereco_obra || formData.endereco,
          status: formData.status,
          valor_terreno: obraData.valor_terreno,
          entrada: obraData.entrada,
          valor_financiado: obraData.valor_financiado,
          subsidio: obraData.subsidio,
          valor_total: valorContratual,
          empreiteiro_nome: obraData.empreiteiro_nome || null,
          // Inicializar outros campos com 0
          empreiteiro: 0,
          material: 0,
          terceirizado: 0,
          mao_de_obra: 0,
          pintor: 0,
          eletricista: 0,
          gesseiro: 0,
          azulejista: 0,
          manutencao: 0,
          empreiteiro_valor_pago: 0,
        };

        const { error: obraError } = await supabase.from("obras").insert([obraToSave]);

        if (obraError) {
          console.error("Erro ao criar obra:", obraError);
          throw obraError;
        }

        // Sucesso - mostrar toast
        toast({
          title: "✅ Cliente e Obra cadastrados!",
          description: `${formData.nome} e sua obra foram cadastrados com sucesso.`,
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
      
      // Como fallback, recarregar a página completamente
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 500);
    } catch (error: unknown) {
      // Erro - manter modal aberto e mostrar mensagem
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar cliente";
      console.error("Erro completo:", error);
      
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

          {/* Separador de Seção - Dados da Obra */}
          <div className="pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-[#F5C800]" />
              <h3 className="text-base font-bold text-[#1E1E1E]">Dados da Obra</h3>
            </div>
          </div>

          {/* Endereço da Obra */}
          <div className="space-y-2">
            <Label htmlFor="endereco_obra" className="text-sm font-semibold">
              Endereço da Obra *
            </Label>
            <Input
              id="endereco_obra"
              required
              value={obraData.endereco_obra}
              onChange={(e) => setObraData({ ...obraData, endereco_obra: e.target.value })}
              placeholder="Se vazio, usará o endereço do cliente"
              disabled={isLoading}
              className="border-2 focus:border-[#F5C800]"
            />
            <p className="text-xs text-muted-foreground">
              Se não preencher, o endereço do cliente será usado
            </p>
          </div>

          {/* Valores Financeiros da Obra */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-700">Valores Financeiros</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Terreno */}
              <div className="space-y-1">
                <Label htmlFor="valor_terreno" className="text-sm font-medium">
                  Terreno (R$)
                </Label>
                <Input
                  id="valor_terreno"
                  type="text"
                  value={obraData.valor_terreno.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    const newValue = Number(numericValue) / 100;
                    setObraData({ ...obraData, valor_terreno: newValue });
                  }}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Entrada */}
              <div className="space-y-1">
                <Label htmlFor="entrada" className="text-sm font-medium">
                  Entrada (R$)
                </Label>
                <Input
                  id="entrada"
                  type="text"
                  value={obraData.entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    const newValue = Number(numericValue) / 100;
                    setObraData({ ...obraData, entrada: newValue });
                  }}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Subsídio */}
              <div className="space-y-1">
                <Label htmlFor="subsidio" className="text-sm font-medium">
                  Subsídio (R$)
                </Label>
                <Input
                  id="subsidio"
                  type="text"
                  value={obraData.subsidio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    const newValue = Number(numericValue) / 100;
                    setObraData({ ...obraData, subsidio: newValue });
                  }}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Valor Financiado */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="valor_financiado" className="text-sm font-medium">
                  Valor Financiado (R$)
                </Label>
                <Input
                  id="valor_financiado"
                  type="text"
                  value={obraData.valor_financiado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    const newValue = Number(numericValue) / 100;
                    setObraData({ ...obraData, valor_financiado: newValue });
                  }}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                  placeholder="0,00"
                />
              </div>

              {/* Nome do Empreiteiro */}
              <div className="space-y-1">
                <Label htmlFor="empreiteiro_nome" className="text-sm font-medium">
                  Nome do Empreiteiro
                </Label>
                <Input
                  id="empreiteiro_nome"
                  type="text"
                  value={obraData.empreiteiro_nome}
                  onChange={(e) => setObraData({ ...obraData, empreiteiro_nome: e.target.value })}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] text-lg h-12 px-4"
                  placeholder="Nome do empreiteiro"
                />
              </div>
            </div>

            {/* Valor Contratual - Destaque */}
            <div className="mt-4 bg-[#F5C800] p-6 rounded-lg">
              <p className="text-sm font-semibold text-[#1E1E1E] mb-2">
                Valor Contratual
              </p>
              <p className="text-3xl font-bold text-[#1E1E1E]">
                R$ {(obraData.entrada + obraData.valor_financiado + obraData.subsidio).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#1E1E1E]/70 mt-2">
                = Entrada + Financiado + Subsídio
              </p>
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
                cliente ? "Atualizar Cliente" : "Cadastrar Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
