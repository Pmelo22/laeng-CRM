"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Obra, Cliente } from "@/lib/types";

interface ObraFormProps {
  obra?: Obra;
}

export function ObraForm({ obra }: ObraFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [formData, setFormData] = useState({
    codigo: obra?.codigo || 0,
    cliente_id: obra?.cliente_id || "",
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

  // Carregar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });

      if (!error && data) {
        setClientes(data);
      }
    };

    fetchClientes();
  }, [supabase]);

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

    if (!formData.cliente_id) {
      setError("Selecione um cliente");
      setIsLoading(false);
      return;
    }

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
    } catch (err) {
      console.error("Erro ao salvar obra:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código da Obra *</Label>
              <Input
                id="codigo"
                type="number"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente">
                    {clientes.find(c => c.id === formData.cliente_id)?.nome || "Selecione o cliente"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {clientes.length} clientes disponíveis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                required
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                placeholder="Ex: DERLANE, ANINHA, LA"
              />
            </div>

            <div>
              <Label htmlFor="entidade">Entidade</Label>
              <Input
                id="entidade"
                value={formData.entidade}
                onChange={(e) => setFormData({ ...formData, entidade: e.target.value })}
                placeholder="Ex: CUS., S.J., A.F.G, PARTICULAR"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as "FINALIZADO" | "EM ANDAMENTO" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM ANDAMENTO">EM ANDAMENTO</SelectItem>
                  <SelectItem value="FINALIZADO">FINALIZADO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fase">Fase</Label>
              <Input
                id="fase"
                value={formData.fase}
                onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                placeholder="Ex: FINALIZADO, INICIO"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader>
          <CardTitle>Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                required
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Ex: ROCHA, CUSTOVILLE, CUSTÓDIA"
              />
            </div>

            <div>
              <Label htmlFor="local_obra">Local da Obra</Label>
              <Input
                id="local_obra"
                value={formData.local_obra}
                onChange={(e) => setFormData({ ...formData, local_obra: e.target.value })}
                placeholder="Ex: ROCHA, CUSTOVILLE"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valores Financeiros */}
      <Card>
        <CardHeader>
          <CardTitle>Valores Financeiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entrada">Entrada (R$)</Label>
              <Input
                id="entrada"
                type="number"
                step="0.01"
                value={formData.entrada}
                onChange={(e) => setFormData({ ...formData, entrada: Number(e.target.value) })}
              />
            </div>

            <div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subsidio">Subsídio (R$)</Label>
              <Input
                id="subsidio"
                type="number"
                step="0.01"
                value={formData.subsidio}
                onChange={(e) => setFormData({ ...formData, subsidio: Number(e.target.value) })}
              />
            </div>

            <div>
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

          <div className="bg-yellow-50 p-4 rounded-md">
            <Label className="text-sm font-semibold">Valor Total (Calculado)</Label>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {formatCurrency(calcularValorTotal())}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Entrada + Valor Financiado + Subsídio
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status e Datas */}
      <Card>
        <CardHeader>
          <CardTitle>Status e Datas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_conclusao">Data de Conclusão</Label>
              <Input
                id="data_conclusao"
                type="date"
                value={formData.data_conclusao}
                onChange={(e) => setFormData({ ...formData, data_conclusao: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="ano_obra">Ano da Obra</Label>
              <Input
                id="ano_obra"
                type="number"
                value={formData.ano_obra}
                onChange={(e) => setFormData({ ...formData, ano_obra: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : obra ? "Atualizar Obra" : "Criar Obra"}
        </Button>
      </div>
    </form>
  );
}
