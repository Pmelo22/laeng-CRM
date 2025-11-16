"use client"

import { AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PDFViewer } from "@/components/pdf-viewer"
import { DocxViewer } from "@/components/docx-viewer"

interface Documento {
  id: string
  tipo_documento: string
  nome_original: string
  caminho_storage: string
  tamanho_bytes: number
  data_upload: string
}

interface DocumentoVisualizarModalProps {
  documento: Documento | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentoVisualizarModal({
  documento,
  open,
  onOpenChange,
}: DocumentoVisualizarModalProps) {
  if (!documento) return null

  const isPdf = documento.caminho_storage.endsWith(".pdf")
  const isDocx =
    documento.caminho_storage.endsWith(".docx") ||
    documento.caminho_storage.endsWith(".doc")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-7xl !w-[98vw] !h-[96vh] !max-h-[96vh] !p-0 !flex !flex-col gap-0">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          Visualizar {documento.nome_original}
        </DialogTitle>

        {/* Header com título */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex items-center gap-4 shrink-0 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#1E1E1E] truncate">
              {documento.nome_original}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {(documento.tamanho_bytes / 1024).toFixed(2)} KB • {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {isPdf ? (
            <div className="flex-1 overflow-hidden">
              <PDFViewer
                url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documentos_clientes/${documento.caminho_storage}`}
                fileName={documento.nome_original}
              />
            </div>
          ) : isDocx ? (
            <div className="flex-1 overflow-hidden">
              <DocxViewer
                url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documentos_clientes/${documento.caminho_storage}`}
                fileName={documento.nome_original}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
              <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-700 text-center mb-2 font-medium">
                Visualização não disponível
              </p>
              <p className="text-gray-500 text-sm">
                Tipo de arquivo: .{documento.caminho_storage.split(".").pop()?.toUpperCase()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
