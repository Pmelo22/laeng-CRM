"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Cliente } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface Obra {
  id: string;
  codigo: number;
  valor_terreno: number;
  entrada: number;
  valor_financiado: number;
  subsidio: number;
  valor_total: number;
}

interface ObraData {
  valor_terreno: number;
  entrada: number;
  valor_financiado: number;
  subsidio: number;
  valor_total: number;
}

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
  const [obras, setObras] = useState<Obra[]>([]);

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

  const [obrasData, setObrasData] = useState<Record<string, ObraData>>({});
  const [loadingCep, setLoadingCep] = useState(false);

  // Atualizar formData quando cliente mudar
  useEffect(() => {
    if (cliente) {
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
      // Reset para novo cliente
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
  }, [cliente]);

  // Buscar obras do cliente quando o modal abrir
  useEffect(() => {
    if (isOpen && cliente) {
      buscarObras();
    }
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
      const initialObrasData: Record<string, ObraData> = {};
      obrasFormatadas.forEach((obra) => {
        initialObrasData[obra.id] = {
          valor_terreno: Number(obra.valor_terreno) || 0,
          entrada: Number(obra.entrada) || 0,
          valor_financiado: Number(obra.valor_financiado) || 0,
          subsidio: Number(obra.subsidio) || 0,
          valor_total: Number(obra.valor_total) || 0,
        };
      });
      setObrasData(initialObrasData);
    } catch (error) {
      console.error("Erro ao buscar obras:", error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
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
        // Atualizar cliente existente
        const { error: clienteError } = await supabase
          .from("clientes")
          .update({ ...baseData, updated_at: new Date().toISOString() })
          .eq("id", cliente.id);

        if (clienteError) throw clienteError;

        // Atualizar valores financeiros de cada obra
        for (const obraId of Object.keys(obrasData)) {
          const obraValues = obrasData[obraId];
          // Calcular valor contratual = terreno + entrada + financiado + subsidio
          const valorContratual = 
            (obraValues.valor_terreno || 0) + 
            (obraValues.entrada || 0) + 
            (obraValues.valor_financiado || 0) + 
            (obraValues.subsidio || 0);
          
          const { error: obraError } = await supabase
            .from("obras")
            .update({
              valor_terreno: obraValues.valor_terreno,
              entrada: obraValues.entrada,
              valor_financiado: obraValues.valor_financiado,
              subsidio: obraValues.subsidio,
              valor_total: valorContratual,
              updated_at: new Date().toISOString()
            })
            .eq("id", obraId);

          if (obraError) throw obraError;
        }

        toast({
          title: "✅ Cliente atualizado!",
          description: `Os dados de ${formData.nome} foram atualizados com sucesso.`,
          duration: 3000,
        });
      } else {
        // Criar novo cliente - gerar código
        const { data: ultimoCliente, error: erroConsulta } = await supabase
          .from("clientes")
          .select("codigo")
          .order("codigo", { ascending: false })
          .limit(1)
          .single();

        if (erroConsulta && erroConsulta.code !== 'PGRST116') {
          console.error("Erro ao buscar último código:", erroConsulta);
          throw erroConsulta;
        }

        const novoCodigo = ultimoCliente ? ultimoCliente.codigo + 1 : 1;

        const dataToSave = {
          ...baseData,
          codigo: novoCodigo,
        };

        const { error: createError } = await supabase.from("clientes").insert([dataToSave]);

        if (createError) throw createError;

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
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 500);
    } catch (error: unknown) {
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {cliente ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {cliente 
              ? "Atualize as informações do cliente abaixo."
              : "Preencha os dados do novo cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cliente *</Label>
            <Input
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              disabled={isLoading}
              className="border-2 focus:border-[#F5C800]"
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
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
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
              className="border-2 focus:border-[#F5C800]"
            />
          </div>

          {/* Status e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "PENDENTE" | "EM ANDAMENTO" | "FINALIZADO") => setFormData({ ...formData, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full border-2 focus:ring-[#F5C800]">
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
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={handleCepChange}
              disabled={isLoading}
              placeholder="00000-000"
              maxLength={9}
              className="border-2 focus:border-[#F5C800]"
            />
            {loadingCep && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
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
              className="border-2 focus:border-[#F5C800]"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                disabled={isLoading}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                disabled={isLoading}
                placeholder="UF"
                maxLength={2}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* Responsável pelo Contato */}
          <div className="space-y-2">
            <Label htmlFor="responsavel_contato">Responsável pelo Contato</Label>
            <Input
              id="responsavel_contato"
              value={formData.responsavel_contato}
              onChange={(e) => setFormData({ ...formData, responsavel_contato: e.target.value })}
              disabled={isLoading}
              placeholder="Ex: LA, DERLANE, ANINHA"
              className="border-2 focus:border-[#F5C800]"
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
              className="border-2 focus:border-[#F5C800] resize-none"
            />
          </div>

          {/* Seção de Valores Financeiros - Apenas se for edição e tiver obras */}
          {cliente && obras.length > 0 && (
            <>
              <div className="pt-4 border-t-2 border-gray-200">
                <h3 className="text-base font-bold text-[#1E1E1E] mb-4">
                  Valores Financeiros
                </h3>
              </div>

              <div className="space-y-6">
                {obras.map((obra) => {
                  // Calcular valores em tempo real
                  const terreno = obrasData[obra.id]?.valor_terreno || 0;
                  const entrada = obrasData[obra.id]?.entrada || 0;
                  const financiado = obrasData[obra.id]?.valor_financiado || 0;
                  const subsidio = obrasData[obra.id]?.subsidio || 0;
                  
                  // Valor Contratual = Terreno + Entrada + Financiado + Subsídio
                  const valorContratual = terreno + entrada + financiado + subsidio;

                  return (
                    <div key={obra.id} className="space-y-4">
                      {/* Primeira linha: 3 campos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`terreno_${obra.id}`} className="text-sm font-medium">Terreno (R$)</Label>
                          <Input
                            id={`terreno_${obra.id}`}
                            type="text"
                            value={terreno.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, '');
                              const newValue = Number(numericValue) / 100;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  valor_terreno: newValue,
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                            placeholder="0,00"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`entrada_${obra.id}`} className="text-sm font-medium">Entrada (R$)</Label>
                          <Input
                            id={`entrada_${obra.id}`}
                            type="text"
                            value={entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, '');
                              const newValue = Number(numericValue) / 100;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  entrada: newValue,
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                            placeholder="0,00"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`subsidio_${obra.id}`} className="text-sm font-medium">Subsídio (R$)</Label>
                          <Input
                            id={`subsidio_${obra.id}`}
                            type="text"
                            value={subsidio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, '');
                              const newValue = Number(numericValue) / 100;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  subsidio: newValue,
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      {/* Segunda linha: 1 campo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`financiado_${obra.id}`} className="text-sm font-medium">Valor Financiado (R$)</Label>
                          <Input
                            id={`financiado_${obra.id}`}
                            type="text"
                            value={financiado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, '');
                              const newValue = Number(numericValue) / 100;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  valor_financiado: newValue,
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      {/* Valor Contratual - Destaque embaixo */}
                      <div className="bg-[#F5C800] p-6 rounded-lg">
                        <p className="text-sm font-semibold text-[#1E1E1E] mb-2">
                          Valor Contratual
                        </p>
                        <p className="text-3xl font-bold text-[#1E1E1E]">
                          R$ {valorContratual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-[#1E1E1E]/70 mt-2">
                          = Terreno + Entrada + Financiado + Subsídio
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Informação para novos clientes ou clientes sem obras */}
          {(!cliente || obras.length === 0) && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  💡 Valores Financeiros
                </p>
                <p className="text-xs text-blue-700">
                  Os valores financeiros serão calculados automaticamente quando você vincular obras a este cliente.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-md">
              {error}
            </div>
          )}
        </form>

        <DialogFooter className="gap-2 sm:gap-0 px-0 pt-4 border-t">
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
            onClick={handleSubmit}
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
      </DialogContent>
    </Dialog>
  );
}
