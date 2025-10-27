"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contrato, Cliente } from "@/lib/types";

interface ContratoFormProps {
  contrato?: Contrato;
  clientes: Pick<Cliente, "id" | "nome">[];
}

export function ContratoForm({ contrato, clientes }: ContratoFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cliente_id: contrato?.cliente_id || "",
    data_inicio: contrato?.data_inicio || "",
    local_obra: contrato?.local_obra || "",
    valor_total: contrato?.valor_total?.toString() || "",
    responsavel: contrato?.responsavel || "",
    tipo_pagamento: contrato?.tipo_pagamento || "Particular",
    status: contrato?.status || "Em andamento",
    observacoes: contrato?.observacoes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const dataToSave = {
        ...formData,
        valor_total: parseFloat(formData.valor_total),
      };

      if (contrato) {
        // Atualizar contrato existente
        const { error } = await supabase
          .from("contratos")
          .update({ ...dataToSave, updated_at: new Date().toISOString() })
          .eq("id", contrato.id);

        if (error) throw error;
      } else {
        // Criar novo contrato
        const { error } = await supabase.from("contratos").insert([dataToSave]);

        if (error) throw error;
      }

      router.push("/dashboard/contratos");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar contrato");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{contrato ? "Editar Contrato" : "Dados do Contrato"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente_id">Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                required
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_total">Valor Total (R$) *</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                required
                value={formData.valor_total}
                onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local_obra">Local da Obra *</Label>
            <Input
              id="local_obra"
              required
              value={formData.local_obra}
              onChange={(e) => setFormData({ ...formData, local_obra: e.target.value })}
            />
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
              <Label htmlFor="tipo_pagamento">Tipo de Pagamento *</Label>
              <Select
                value={formData.tipo_pagamento}
                onValueChange={(value: "Caixa" | "Particular") =>
                  setFormData({ ...formData, tipo_pagamento: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Particular">Particular</SelectItem>
                  <SelectItem value="Caixa">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "Em andamento" | "Concluído" | "Cancelado") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : contrato ? "Atualizar" : "Cadastrar"}
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
