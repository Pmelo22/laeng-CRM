"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { AlertCircle, ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ViewerLoadingState } from "@/components/documento-base-viewer"

interface DocxViewerProps {
  url: string
  fileName?: string
}

export function DocxViewer({ url, fileName = "documento.docx" }: DocxViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(100)
  const [isDownloading, setIsDownloading] = useState(false)

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

        // Aguardar carregamento do iframe
        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar documento")
        console.error("Erro ao carregar DOCX:", err)
        setIsLoading(false)
      }
    }

    loadDocx()
  }, [url])



  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 10, 200))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 10, 50))
  }, [])

  const handleResetZoom = useCallback(() => {
    setScale(100)
  }, [])

  const handleDownloadDocx = useCallback(async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      
      // Extrair nome do arquivo da URL ou usar o padrão
      let downloadFileName = fileName
      if (!downloadFileName || downloadFileName === "documento.docx") {
        // Tentar extrair do caminho da URL
        const urlParts = url.split("/")
        const lastPart = urlParts[urlParts.length - 1]
        downloadFileName = lastPart.includes(".") ? lastPart : "documento.docx"
      }
      
      link.download = downloadFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Erro ao baixar DOCX:", err)
    } finally {
      setIsDownloading(false)
    }
  }, [url, fileName])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-50 p-6 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600 font-semibold text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Toolbar com controles */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        {/* Zoom - Centro */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Button
            onClick={handleZoomOut}
            disabled={scale <= 50 || isLoading}
            variant="outline"
            size="sm"
            title="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <div
            className="bg-gray-100 px-4 py-1 rounded text-sm font-semibold min-w-16 text-center border cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleResetZoom}
            title="Clique para resetar zoom"
          >
            {scale}%
          </div>

          <Button
            onClick={handleZoomIn}
            disabled={scale >= 200 || isLoading}
            variant="outline"
            size="sm"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Download Button */}
        <div className="ml-4">
          <button
            onClick={handleDownloadDocx}
            disabled={isLoading || isDownloading}
            className="bg-[#F5C800] hover:bg-[#E5B800] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#1E1E1E] font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
            title="Baixar DOCX"
          >
            <Download className="h-4 w-4" />
            <span>Baixar</span>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-200 scrollbar-hide">
        {isLoading ? (
          <ViewerLoadingState />
        ) : (
          <div className="flex justify-center p-4" style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
            <iframe
              ref={iframeRef}
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
              className="w-[1024px] h-[768px] border-0 bg-white rounded-lg shadow-lg"
              title="Visualizador de DOCX"
            />
          </div>
        )}
      </div>
    </div>
  )
}
