"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react"
import { ViewerLoadingState } from "@/components/documento-base-viewer"

interface PDFViewerProps {
  url: string
  fileName?: string
}

type PDFDocumentType = { numPages: number; getPage: (num: number) => Promise<unknown> } | null
type PDFPageType = {
  getViewport: (opts: { scale: number }) => { width: number; height: number }
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> }
}

export function PDFViewer({ url, fileName = "documento.pdf" }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<PDFDocumentType>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Configurar PDF.js worker
  useEffect(() => {
    const setupWorker = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist")
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
      } catch (err) {
        console.error("Erro ao configurar worker:", err)
      }
    }
    setupWorker()
  }, [])

  // Carregar PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentPage(1)

        const pdfjsLib = await import("pdfjs-dist")
        const pdf = await pdfjsLib.getDocument(url).promise
        pdfDocRef.current = pdf
        setTotalPages(pdf.numPages)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar PDF"
        setError(message)
        console.error("Erro ao carregar PDF:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPdf()
  }, [url])

  // Renderizar página
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocRef.current || !canvasRef.current || isLoading) {
        return
      }

      setIsRendering(true)

      try {
        const page = await pdfDocRef.current.getPage(currentPage) as PDFPageType
        const viewport = page.getViewport({ scale })

        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (!context) {
          throw new Error("Não foi possível obter contexto do canvas")
        }

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise
      } catch (err) {
        if (err instanceof Error && err.name !== "RenderingCancelledException") {
          console.error("Erro ao renderizar:", err)
        }
      } finally {
        setIsRendering(false)
      }
    }

    renderPage()
  }, [currentPage, scale, isLoading])

  // Scroll para o topo quando zoom muda
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [scale])

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.75))
  }, [])

  const handleResetZoom = useCallback(() => {
    setScale(1.5)
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Erro ao baixar PDF:", err)
    } finally {
      setIsDownloading(false)
    }
  }, [url, fileName])

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600 font-semibold mb-2">Erro ao carregar PDF</p>
        <p className="text-red-500 text-sm text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Barra de ferramentas */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between gap-4">
        {/* Navegação - Esquerda */}
        <div className="flex items-center">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading || isRendering}
            variant="outline"
            size="sm"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="bg-gray-100 px-3 py-1 rounded text-sm font-semibold min-w-28 text-center">
            {isLoading ? "Carregando..." : `${currentPage} / ${totalPages}`}
          </div>

          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading || isRendering || totalPages === 0}
            variant="outline"
            size="sm"
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom - Centro */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Button
            onClick={handleZoomOut}
            disabled={scale <= 0.75 || isLoading || isRendering}
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
            {Math.round(scale * 100)}%
          </div>

          <Button
            onClick={handleZoomIn}
            disabled={scale >= 3 || isLoading || isRendering}
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
              onClick={handleDownloadPdf}
              disabled={isLoading || isDownloading}
              className="bg-[#F5C800] hover:bg-[#E5B800] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#1E1E1E] font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
              title="Baixar PDF"
            >
              <Download className="h-4 w-4" />
              <span>Baixar</span>
            </button>
        </div>
    </div>

      {/* Área de visualização */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4 bg-gray-200">
        {isLoading ? (
          <ViewerLoadingState />
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-lg bg-white rounded mx-auto"
          />
        )}
      </div>

      {/* Rodapé */}
      {!isLoading && (
        <div className="bg-white border-t px-4 py-2 text-xs text-gray-600 text-center">
          {totalPages > 0 && (
            <span>{totalPages} página{totalPages !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}
    </div>
  )
}
