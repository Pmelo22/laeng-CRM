/**
 * Hook para upload de documentos com otimização e integração Supabase
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { 
  optimizeDocument, 
  isValidDocumentType, 
  validateFileSize, 
  formatFileSize 
} from '@/lib/document-utils'

interface UploadState {
  isLoading: boolean
  error?: string
  progress: number
  success: boolean
}

interface DocumentUploadConfig {
  clienteId: string
  tipoDocumento: 'documento_1' | 'documento_2' | 'documento_3' | 'documento_4' | 'documento_5'
  file: File
}

export function useDocumentUpload() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [uploadState, setUploadState] = useState<UploadState>({
    isLoading: false,
    progress: 0,
    success: false,
  })

  const uploadDocument = async (config: DocumentUploadConfig) => {
    const { clienteId, tipoDocumento, file } = config
    
    setUploadState({ isLoading: true, progress: 0, success: false })

    try {
      // 1. Validar tipo de arquivo
      if (!isValidDocumentType(file)) {
        throw new Error('Apenas arquivos PDF, DOC e DOCX são permitidos')
      }

      setUploadState(prev => ({ ...prev, progress: 10 }))

      // 2. Validar tamanho
      const sizeValidation = validateFileSize(file, 10)
      if (!sizeValidation.valid) {
        throw new Error(sizeValidation.error)
      }

      setUploadState(prev => ({ ...prev, progress: 20 }))

      // 3. Otimizar documento
      console.log(`Otimizando ${file.name}...`)
      const optimizationResult = await optimizeDocument(file)
      
      console.log(`Tamanho original: ${formatFileSize(optimizationResult.originalSize)}`)
      console.log(`Tamanho otimizado: ${formatFileSize(optimizationResult.optimizedSize)}`)
      console.log(`Compressão: ${optimizationResult.compressionRatio.toFixed(2)}%`)

      setUploadState(prev => ({ ...prev, progress: 40 }))

      // 4. Preparar dados para Edge Function
      const timestamp = new Date().getTime()
      const extension = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${tipoDocumento}_${timestamp}.${extension}`

      console.log(`Enviando para Edge Function: ${fileName}`)
      setUploadState(prev => ({ ...prev, progress: 50 }))

      // 5. Chamar Edge Function (que fará upload com service role key, ignorando RLS)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Preparar FormData para enviar arquivo como multipart
      const formData = new FormData()
      formData.append('clienteId', clienteId)
      formData.append('tipoDocumento', tipoDocumento)
      formData.append('fileName', fileName)
      formData.append('nomeOriginal', file.name)
      formData.append('tamanho', optimizationResult.optimizedSize.toString())
      formData.append('file', optimizationResult.optimizedFile)

      const response = await fetch(
        `${supabaseUrl}/functions/v1/upload-document`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao fazer upload via Edge Function')
      }

      const result = await response.json()

      setUploadState({ isLoading: false, progress: 100, success: true })

      toast({
        title: '✅ Documento enviado com sucesso!',
        description: `${file.name} (${formatFileSize(optimizationResult.optimizedSize)})`,
        duration: 3000,
      })

      // Atualizar página após 1 segundo
      setTimeout(() => {
        router.refresh()
      }, 1000)

      return {
        success: true,
        publicUrl: result.publicUrl,
        filePath: result.filePath,
        optimizedSize: result.tamanho,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload'
      
      console.error('Erro ao fazer upload:', errorMessage)
      
      setUploadState({
        isLoading: false,
        progress: 0,
        success: false,
        error: errorMessage,
      })

      toast({
        title: '❌ Erro ao enviar documento',
        description: errorMessage,
        variant: 'destructive',
        duration: 4000,
      })

      return { success: false, error: errorMessage }
    }
  }

  const deleteDocument = async (clienteId: string, tipoDocumento: string) => {
    try {
      // Buscar documento para obter o caminho
      const { data, error: fetchError } = await supabase
        .from('documentos_cliente')
        .select('caminho_storage')
        .eq('cliente_id', clienteId)
        .eq('tipo_documento', tipoDocumento)
        .single()

      if (fetchError || !data) {
        throw new Error('Documento não encontrado no banco de dados')
      }

      console.log('Deletando arquivo:', data.caminho_storage)

      // Chamar Edge Function para deletar (usa service role key)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const deleteResponse = await fetch(
        `${supabaseUrl}/functions/v1/delete-document`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            caminhoStorage: data.caminho_storage,
            clienteId,
            tipoDocumento,
          }),
        }
      )

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json()
        throw new Error(errorData.error || 'Erro ao deletar arquivo via Edge Function')
      }

      console.log('Arquivo deletado com sucesso')

      toast({
        title: '✅ Documento removido!',
        description: 'O documento foi deletado com sucesso.',
        duration: 3000,
      })

      router.refresh()

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar documento'
      
      console.error('Erro completo ao deletar:', error)
      
      toast({
        title: '❌ Erro ao remover documento',
        description: errorMessage,
        variant: 'destructive',
        duration: 4000,
      })

      return { success: false, error: errorMessage }
    }
  }

  return {
    uploadDocument,
    deleteDocument,
    uploadState,
  }
}
