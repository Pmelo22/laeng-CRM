"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cliente } from "@/lib/types";
import { DollarSign } from "lucide-react";

interface ClienteFormProps {
  cliente?: Cliente;
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: cliente?.nome || "",
    status: cliente?.status || "FINALIZADO",
    endereco: cliente?.endereco || "",
    data_cadastro: cliente?.data_cadastro || new Date().toISOString().split('T')[0],
    // Valores Financeiros
    valor_terreno: cliente?.valor_terreno || 0,
    entrada: cliente?.entrada || 0,
    valor_financiado: cliente?.valor_financiado || 0,
    subsidio: cliente?.subsidio || 0,
    valor_total: cliente?.valor_total || 0,
  });

  // Calcular Valor Total Automaticamente
  const valorTotalCalculado = useMemo(() => {
    return formData.valor_terreno + formData.entrada + formData.valor_financiado + formData.subsidio;
  }, [formData.valor_terreno, formData.entrada, formData.valor_financiado, formData.subsidio]);

  // Atualizar valor_total quando os componentes mudarem
  useEffect(() => {
    setFormData(prev => ({ ...prev, valor_total: valorTotalCalculado }));
  }, [valorTotalCalculado]);

  // Formatar valor monetário para exibição
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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

      router.push("/dashboard/clientes");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cliente *</Label>
            <Input
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite o nome do cliente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value as "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
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
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              required
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Cidade ou endereço completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_cadastro">Data de Cadastro *</Label>
            <Input
              id="data_cadastro"
              type="date"
              required
              value={formData.data_cadastro}
              onChange={(e) => setFormData({ ...formData, data_cadastro: e.target.value })}
            />
          </div>

          {/* Separador - Valores Financeiros */}
          <div className="pt-4 border-t-2 border-[#F5C800]/20">
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#F5C800]" />
              Valores Financeiros
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Valores relacionados aos projetos/obras do cliente
            </p>
          </div>

          {/* Grid de Valores Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor do Terreno */}
            <div className="space-y-2">
              <Label htmlFor="valor_terreno">Valor do Terreno (R$)</Label>
              <Input
                id="valor_terreno"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_terreno || ''}
                onChange={(e) => setFormData({ ...formData, valor_terreno: Number(e.target.value) || 0 })}
                placeholder="0,00"
                disabled={isLoading}
              />
            </div>

            {/* Entrada */}
            <div className="space-y-2">
              <Label htmlFor="entrada">Entrada (R$)</Label>
              <Input
                id="entrada"
                type="number"
                step="0.01"
                min="0"
                value={formData.entrada || ''}
                onChange={(e) => setFormData({ ...formData, entrada: Number(e.target.value) || 0 })}
                placeholder="0,00"
                disabled={isLoading}
              />
            </div>

            {/* Valor Financiado */}
            <div className="space-y-2">
              <Label htmlFor="valor_financiado">Valor Financiado (R$)</Label>
              <Input
                id="valor_financiado"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_financiado || ''}
                onChange={(e) => setFormData({ ...formData, valor_financiado: Number(e.target.value) || 0 })}
                placeholder="0,00"
                disabled={isLoading}
              />
            </div>

            {/* Subsídio */}
            <div className="space-y-2">
              <Label htmlFor="subsidio">Subsídio (R$)</Label>
              <Input
                id="subsidio"
                type="number"
                step="0.01"
                min="0"
                value={formData.subsidio || ''}
                onChange={(e) => setFormData({ ...formData, subsidio: Number(e.target.value) || 0 })}
                placeholder="0,00"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Valor Total - Calculado Automaticamente */}
          <div className="p-4 bg-[#F5C800]/10 rounded-lg border-2 border-[#F5C800]">
            <Label className="text-lg font-semibold text-[#1E1E1E]">
              Valor Total Calculado
            </Label>
            <p className="text-3xl font-bold text-[#F5C800] mt-2">
              {formatCurrency(valorTotalCalculado)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Terreno + Entrada + Valor Financiado + Subsídio
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90"
            >
              {isLoading ? "Salvando..." : cliente ? "Atualizar Cliente" : "Cadastrar Cliente"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
