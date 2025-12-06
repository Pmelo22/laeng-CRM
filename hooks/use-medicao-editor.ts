"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatMoneyInput } from "@/lib/utils";

export interface MedicaoData {
  numero: number;
  valor: number;
  dataComputacao?: string;
}

interface UseMedicaoEditorReturn {
  medicaoEditando: MedicaoData | null;
  obraIdEditando: string | null;
  isLoadingMedicao: boolean;
  inputValue: string;
  abrirEditor: (obraId: string, numeroMedicao: number, valorAtual: number, dataComputacao?: string) => void;
  fecharEditor: () => void;
  setInputValue: (value: string) => void;
  salvarMedicao: () => Promise<void>;
  atualizarValor: (novoValor: number) => void;
}

/**
 * Hook para gerenciar edição de medições de obras
 * Consolida 4 useState em uma interface coerente
 */
export function useMedicaoEditor(): UseMedicaoEditorReturn {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [medicaoEditando, setMedicaoEditando] = useState<MedicaoData | null>(null);
  const [obraIdEditando, setObraIdEditando] = useState<string | null>(null);
  const [isLoadingMedicao, setIsLoadingMedicao] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  // Sincronizar input com medicaoEditando
  useEffect(() => {
    if (medicaoEditando) {
      setInputValue(formatMoneyInput(medicaoEditando.valor));
    }
  }, [medicaoEditando]);

  const abrirEditor = useCallback(
    (obraId: string, numeroMedicao: number, valorAtual: number, dataComputacao?: string) => {
      setObraIdEditando(obraId);
      setMedicaoEditando({
        numero: numeroMedicao,
        valor: valorAtual,
        dataComputacao: dataComputacao || undefined,
      });
    },
    []
  );

  const fecharEditor = useCallback(() => {
    setMedicaoEditando(null);
    setObraIdEditando(null);
    setInputValue("");
  }, []);

  const atualizarValor = useCallback((novoValor: number) => {
    setMedicaoEditando(prev => {
      if (!prev) return null;
      return { ...prev, valor: novoValor };
    });
  }, []);

  const salvarMedicao = useCallback(async () => {
    if (!medicaoEditando || !obraIdEditando) return;

    setIsLoadingMedicao(true);
    try {
      const dataComputacao = new Date().toISOString();
      const numeroMedicao = medicaoEditando.numero;
      const campoMedicao = `medicao_0${numeroMedicao}`;
      const campoDataComputacao = `medicao_0${numeroMedicao}_data_computacao`;

      const updateData: Record<string, string | number> = {
        [campoMedicao]: medicaoEditando.valor,
        [campoDataComputacao]: dataComputacao,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("obras")
        .update(updateData)
        .eq("id", obraIdEditando);

      if (error) throw error;

      toast({
        title: "✅ Medição salva!",
        description: `Medição ${medicaoEditando.numero} atualizada com sucesso.`,
        duration: 3000,
      });

      fecharEditor();

      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar medição:", error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Ocorreu um erro ao salvar a medição. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoadingMedicao(false);
    }
  }, [medicaoEditando, obraIdEditando, supabase, router, toast, fecharEditor]);

  return {
    medicaoEditando,
    obraIdEditando,
    isLoadingMedicao,
    inputValue,
    abrirEditor,
    fecharEditor,
    setInputValue,
    salvarMedicao,
    atualizarValor,
  };
}
