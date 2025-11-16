"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { useDocumentViewer, ViewerLoadingState, DownloadButton } from "@/components/documento-base-viewer"

interface DocxViewerProps {
  url: string
  fileName?: string
  caminhoStorage?: string
}

export function DocxViewer({ url, fileName, caminhoStorage }: DocxViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { handleDownload, downloading } = useDocumentViewer(caminhoStorage, fileName)

  useEffect(() => {
    const loadDocx = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Verificar se a URL é acessível
        const response = await fetch(url, { method: "HEAD" })
        if (!response.ok) {
          throw new Error("Arquivo não acessível")
        }

        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar documento")
        console.error("Erro ao carregar DOCX:", err)
        setIsLoading(false)
      }
    }

    loadDocx()
  }, [url])



  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-50 p-6 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600 font-semibold text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar com download */}
      {caminhoStorage && fileName && (
        <div className="bg-white border-b px-4 py-3 flex items-center justify-end gap-2 shrink-0">
          <DownloadButton
            onClick={handleDownload}
            disabled={isLoading}
            loading={downloading}
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <ViewerLoadingState />
        ) : (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            className="w-full h-full border-0"
            title="Visualizador de DOCX"
          />
        )}
      </div>
    </div>
  )
}
