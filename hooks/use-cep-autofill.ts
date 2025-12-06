"use client";

import { useState, useCallback } from "react";
import { buscarCepViaCep } from "@/lib/utils";

interface UseCEPAutofillReturn {
  cep: string;
  setCep: (cep: string) => void;
  loadingCep: boolean;
  endereco: string;
  cidade: string;
  estado: string;
  setEndereco: (endereco: string) => void;
  setCidade: (cidade: string) => void;
  setEstado: (estado: string) => void;
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

/**
 * Hook para buscar e auto-preencher endereço via CEP
 * Elimina duplicação entre componentes que usam busca de CEP
 */
export function useCEPAutofill(): UseCEPAutofillReturn {
  const [cep, setCep] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const handleCepChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value;
    setCep(newCep);

    const cepLimpo = newCep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      const data = await buscarCepViaCep(newCep);
      if (data && !data.erro) {
        // Apenas preenche se os campos estiverem vazios (não sobrescreve)
        setEndereco(prev => prev || data.logradouro || "");
        setCidade(prev => prev || data.localidade || "");
        setEstado(prev => prev || data.uf || "");
      }
      setLoadingCep(false);
    }
  }, []);

  return {
    cep,
    setCep,
    loadingCep,
    endereco,
    cidade,
    estado,
    setEndereco,
    setCidade,
    setEstado,
    handleCepChange,
  };
}
