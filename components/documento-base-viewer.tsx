"use client"

import { useState } from "react"
import { AlertCircle, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDocumentDownload } from "@/hooks/use-document-download"
import { useToast } from "@/hooks/use-toast"

/**
 * Hook compartilhado para lógica de download de documentos
 */
export function useDocumentViewer(
  caminhoStorage?: string,
  fileName?: string
) {
  const { handleDownload: downloadFile } = useDocumentDownload()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!caminhoStorage || !fileName) return
    try {
      setDownloading(true)
      await downloadFile(caminhoStorage, fileName)
      toast({
        title: "Sucesso",
        description: "Documento baixado com sucesso",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Falha ao baixar documento",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  return { handleDownload, downloading }
}

/**
 * Componente de erro compartilhado
 */
export function ViewerErrorState({
  error,
  onDownload,
  downloading,
  isCentered = true,
}: {
  error: string
  onDownload?: () => Promise<void>
  downloading?: boolean
  isCentered?: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isCentered ? "h-full" : "p-6 rounded-lg"
      } bg-red-50`}
    >
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <p className="text-red-600 font-semibold text-center mb-4">{error}</p>
      {onDownload && (
        <Button
          onClick={onDownload}
          disabled={downloading}
          className="gap-2 bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-semibold"
          size="sm"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Baixando
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Baixar arquivo
            </>
          )}
        </Button>
      )}
    </div>
  )
}

/**
 * Componente de loading compartilhado
 */
export function ViewerLoadingState() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold">Carregando documento...</p>
      </div>
    </div>
  )
}

/**
 * Botão de download reutilizável
 */
export function DownloadButton({
  onClick,
  disabled,
  size = "sm",
  showText = false,
  loading = false,
}: {
  onClick: () => Promise<void>
  disabled?: boolean
  size?: "sm" | "lg"
  showText?: boolean
  loading?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className="gap-2 bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-semibold"
      size={size}
      title="Baixar arquivo"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && "Baixando"}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {showText && "Baixar"}
        </>
      )}
    </Button>
  )
}
