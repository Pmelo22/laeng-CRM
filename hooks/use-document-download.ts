import { createClient } from '@/lib/supabase/client'

export function useDocumentDownload() {
  const handleDownload = async (caminhoStorage: string, nomeOriginal: string) => {
    try {
      const supabase = createClient()
      
      // Obter arquivo do storage
      const { data, error } = await supabase.storage
        .from('documentos_clientes')
        .download(caminhoStorage)
      
      if (error) throw error
      
      // Criar blob e fazer download
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = nomeOriginal
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
      throw error
    }
  }

  return { handleDownload }
}
