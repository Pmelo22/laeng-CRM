"use client";

import { useState, useCallback, useMemo } from "react";

interface UseFormStateReturn<T> {
  formData: T;
  setField: (field: keyof T, value: unknown) => void;
  setFormData: (data: T | ((prev: T) => T)) => void;
  resetForm: (initialData: T) => void;
  isDirty: boolean;
  getFieldValue: (field: keyof T) => unknown;
}

/**
 * Hook genérico para gerenciar estado de formulário
 * Substitui múltiplos useState por uma interface unificada
 * Oferece detecção de mudanças (isDirty) e reset automático
 */
export function useFormState<T>(initialData: T): UseFormStateReturn<T> {
  const [formData, setFormDataState] = useState<T>(initialData);
  const [originalData] = useState<T>(initialData);

  // Detecta se formulário foi modificado
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  const setField = useCallback((field: keyof T, value: unknown) => {
    setFormDataState(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFormData = useCallback((data: T | ((prev: T) => T)) => {
    setFormDataState(data);
  }, []);

  const resetForm = useCallback((initialData: T) => {
    setFormDataState(initialData);
  }, []);

  const getFieldValue = useCallback((field: keyof T) => {
    return formData[field];
  }, [formData]);

  return {
    formData,
    setField,
    setFormData,
    resetForm,
    isDirty,
    getFieldValue,
  };
}
