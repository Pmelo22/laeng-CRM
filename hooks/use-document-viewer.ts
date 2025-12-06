"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseDocumentViewerReturn {
  currentPage: number;
  totalPages: number;
  scale: number;
  isLoading: boolean;
  isRendering: boolean;
  isDownloading: boolean;
  error: string | null;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleDownloadDocument: (url: string, fileName: string) => Promise<void>;
  setTotalPages: (pages: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook para gerenciar visualização de documentos (PDF, DOCX, etc)
 * Consolida lógica compartilhada entre diferentes visualizadores
 */
export function useDocumentViewer(initialScale: number = 1.5): UseDocumentViewerReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(initialScale);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll para topo quando zoom muda
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [scale]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPageState(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPageState(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.75));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(initialScale);
  }, [initialScale]);

  const handleDownloadDocument = useCallback(async (url: string, fileName: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Erro ao baixar documento:", err);
      setError(err instanceof Error ? err.message : "Erro ao baixar documento");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  return {
    currentPage,
    totalPages,
    scale,
    isLoading,
    isRendering,
    isDownloading,
    error,
    handlePreviousPage,
    handleNextPage,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleDownloadDocument,
    setTotalPages,
    setIsLoading,
    setError,
    setCurrentPage,
    canvasRef,
    containerRef,
  };
}
