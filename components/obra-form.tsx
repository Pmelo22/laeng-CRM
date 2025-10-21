"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Obra } from "@/lib/types";

interface ObraFormProps {
  obra?: Obra;
}

export function ObraForm({ obra }: ObraFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    codigo: obra?.codigo || 0,
    cliente_nome: obra?.cliente_nome || "",
    responsavel: obra?.responsavel || "",
    entidade: obra?.entidade || "",
    endereco: obra?.endereco || "",
    status: obra?.status || "EM ANDAMENTO",
    entrada: obra?.entrada || 0,
    valor_financiado: obra?.valor_financiado || 0,
    subsidio: obra?.subsidio || 0,
    valor_total: obra?.valor_total || 0,
    data_conclusao: obra?.data_conclusao || "",
    valor_terreno: obra?.valor_terreno || 0,
    ano_obra: obra?.ano_obra || new Date().getFullYear(),
    local_obra: obra?.local_obra || "",
    fase: obra?.fase || "",
  });

  // Calcular valor total automaticamente
  const calcularValorTotal = () => {
    const entrada = Number(formData.entrada) || 0;
    const valorFinanciado = Number(formData.valor_financiado) || 0;
    const subsidio = Number(formData.subsidio) || 0;
    return entrada + valorFinanciado + subsidio;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const dataToSave = {
        ...formData,
        valor_total: calcularValorTotal(),
        entrada: Number(formData.entrada),
        valor_financiado: Number(formData.valor_financiado),
        subsidio: Number(formData.subsidio),
        valor_terreno: Number(formData.valor_terreno),
        ano_obra: Number(formData.ano_obra),
        codigo: Number(formData.codigo),
      };

      if (obra) {
        // Atualizar obra existente
        const { error } = await supabase
          .from("obras")
          .update({ ...dataToSave, updated_at: new Date().toISOString() })
          .eq("id", obra.id);

        if (error) throw error;
      } else {
        // Criar nova obra
        const { error } = await supabase.from("obras").insert([dataToSave]);

        if (error) throw error;
      }

      router.push("/dashboard/obras");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar obra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{obra ? "Editar Obra" : "Dados da Obra"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  type="number"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                <Input
                  id="cliente_nome"
                  required
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável *</Label>
                <Input
                  id="responsavel"
                  required
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entidade">Entidade</Label>
                <Input
                  id="entidade"
                  value={formData.entidade}
                  onChange={(e) => setFormData({ ...formData, entidade: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Localização</h3>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                required
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="local_obra">Local da Obra</Label>
                <Input
                  id="local_obra"
                  value={formData.local_obra}
                  onChange={(e) => setFormData({ ...formData, local_obra: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fase">Fase</Label>
                <Input
                  id="fase"
                  value={formData.fase}
                  onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Valores Financeiros</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entrada">Entrada (R$)</Label>
                <Input
                  id="entrada"
                  type="number"
                  step="0.01"
                  value={formData.entrada}
                  onChange={(e) => setFormData({ ...formData, entrada: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_financiado">Valor Financiado (R$) *</Label>
                <Input
                  id="valor_financiado"
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_financiado}
                  onChange={(e) => setFormData({ ...formData, valor_financiado: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subsidio">Subsídio (R$)</Label>
                <Input
                  id="subsidio"
                  type="number"
                  step="0.01"
                  value={formData.subsidio}
                  onChange={(e) => setFormData({ ...formData, subsidio: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_terreno">Valor do Terreno (R$)</Label>
                <Input
                  id="valor_terreno"
                  type="number"
                  step="0.01"
                  value={formData.valor_terreno}
                  onChange={(e) => setFormData({ ...formData, valor_terreno: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <Label className="text-lg font-semibold">Valor Total Calculado</Label>
              <p className="text-3xl font-bold text-primary mt-2">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(calcularValorTotal())}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Entrada + Valor Financiado + Subsídio
              </p>
            </div>
          </div>

          {/* Status e Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status e Datas</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'EM ANDAMENTO' | 'FINALIZADO' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EM ANDAMENTO">EM ANDAMENTO</SelectItem>
                    <SelectItem value="FINALIZADO">FINALIZADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_conclusao">Data de Conclusão</Label>
                <Input
                  id="data_conclusao"
                  type="date"
                  value={formData.data_conclusao}
                  onChange={(e) => setFormData({ ...formData, data_conclusao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano_obra">Ano da Obra</Label>
                <Input
                  id="ano_obra"
                  type="number"
                  value={formData.ano_obra}
                  onChange={(e) => setFormData({ ...formData, ano_obra: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-black"
            >
              {isLoading ? "Salvando..." : obra ? "Atualizar" : "Cadastrar"}
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
