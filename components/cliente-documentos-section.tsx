"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileUp, Trash2, Download, AlertCircle, CheckCircle2, Clock, Eye } from "lucide-react"
import { useDocumentUpload } from "@/hooks/use-document-upload"
import { formatFileSize } from "@/lib/document-utils"
import { DocumentoVisualizarModal } from "@/components/documento-visualizar-modal"

interface ClienteDocumentosSectionProps {
  clienteId: string
  documentos?: Array<{
    id: string
    tipo_documento: string
    nome_original: string
    caminho_storage: string
    tamanho_bytes: number
    data_upload: string
  }>
}

type TipoDocumento = 'documento_1' | 'documento_2' | 'documento_3' | 'documento_4' | 'documento_5'

const TIPOS_DOCUMENTOS: { tipo: TipoDocumento; label: string }[] = [
  { tipo: 'documento_1', label: 'Documento 1' },
  { tipo: 'documento_2', label: 'Documento 2' },
  { tipo: 'documento_3', label: 'Documento 3' },
  { tipo: 'documento_4', label: 'Documento 4' },
  { tipo: 'documento_5', label: 'Documento 5' },
]

export function ClienteDocumentosSection({ clienteId, documentos = [] }: ClienteDocumentosSectionProps) {
  const { uploadDocument, deleteDocument, uploadState } = useDocumentUpload()
  const [uploadingType, setUploadingType] = useState<TipoDocumento | null>(null)
  const [viewingDoc, setViewingDoc] = useState<typeof documentos[0] | null>(null)
  const fileInputRefs = useRef<Record<TipoDocumento, HTMLInputElement | null>>({
    documento_1: null,
    documento_2: null,
    documento_3: null,
    documento_4: null,
    documento_5: null,
  })

  // Mapa de documentos por tipo
  const documentosPorTipo = documentos.reduce((acc, doc) => {
    acc[doc.tipo_documento as TipoDocumento] = doc
    return acc
  }, {} as Record<TipoDocumento, typeof documentos[0]>)

  const handleFileSelect = async (tipoDocumento: TipoDocumento, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingType(tipoDocumento)

    await uploadDocument({
      clienteId,
      tipoDocumento,
      file,
    })

    setUploadingType(null)
    // Limpar input
    if (fileInputRefs.current[tipoDocumento]) {
      fileInputRefs.current[tipoDocumento]!.value = ''
    }
  }

  const handleDelete = async (tipoDocumento: TipoDocumento) => {
    if (confirm('Tem certeza que deseja deletar este documento?')) {
      await deleteDocument(clienteId, tipoDocumento)
    }
  }

  const handleDownload = async (doc: typeof documentos[0]) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documentos_clientes/${doc.caminho_storage}`
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = doc.nome_original
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Erro ao baixar documento:", err)
      alert("Erro ao baixar o documento")
    }
  }

  const getStatusBadge = (tipoDocumento: TipoDocumento) => {
    if (uploadingType === tipoDocumento) {
      return (
        <Badge className="bg-blue-100 text-blue-700 font-semibold flex items-center gap-1.5">
          <Clock className="h-3 w-3 animate-spin" />
          Enviando...
        </Badge>
      )
    }

    const doc = documentosPorTipo[tipoDocumento]
    if (doc) {
      return (
        <Badge className="bg-green-100 text-green-700 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3" />
          Salvo
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="text-gray-600 font-semibold">
        Nenhum arquivo
      </Badge>
    )
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl uppercase">
          <FileUp className="h-5 w-5 text-blue-600" />
          DOCUMENTOS
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="space-y-4">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Formatos aceitos: PDF, DOC, DOCX</p>
              <p className="text-xs opacity-90">Máximo 10MB por arquivo. Os arquivos são comprimidos automaticamente.</p>
            </div>
          </div>

          {/* Grid de slots de upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TIPOS_DOCUMENTOS.map(({ tipo, label }) => {
              const doc = documentosPorTipo[tipo]
              const isUploading = uploadingType === tipo

              return (
                <div key={tipo} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {/* Cabeçalho */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-sm text-[#1E1E1E] uppercase">{label}</h3>
                    {getStatusBadge(tipo)}
                  </div>

                  {/* Conteúdo */}
                  {doc ? (
                    <div className="space-y-3">
                      <div className="bg-white rounded p-2 border border-gray-300">
                        <p className="text-xs font-mono text-gray-700 truncate">{doc.nome_original}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(doc.tamanho_bytes)} • {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-black"
                          onClick={() => setViewingDoc(doc)}
                          disabled={isUploading}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleDownload(doc)}
                          disabled={isUploading}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Baixar
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleDelete(tipo)}
                          disabled={isUploading}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current[tipo] = el
                        }}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => handleFileSelect(tipo, e)}
                        disabled={isUploading}
                        className="hidden"
                      />

                      <Button
                        size="sm"
                        onClick={() => fileInputRefs.current[tipo]?.click()}
                        disabled={isUploading}
                        className="w-full bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-semibold text-xs"
                      >
                        {isUploading ? (
                          <>
                            <Clock className="h-3 w-3 mr-1 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <FileUp className="h-3 w-3 mr-1" />
                            Anexar Arquivo
                          </>
                        )}
                      </Button>

                      {/* Barra de progresso */}
                      {isUploading && (
                        <div className="w-full bg-gray-300 rounded-full h-1.5">
                          <div
                            className="bg-[#F5C800] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadState.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mensagem de erro global */}
          {uploadState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-semibold">Erro ao enviar documento</p>
                <p className="text-xs opacity-90 mt-1">{uploadState.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal de visualização */}
        <DocumentoVisualizarModal
          documento={viewingDoc}
          open={!!viewingDoc}
          onOpenChange={(open) => {
            if (!open) {
              setViewingDoc(null)
            }
          }}
        />
      </CardContent>
    </Card>
  )
}
