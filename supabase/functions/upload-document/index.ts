import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Receber FormData do request
    const formData = await req.formData()
    const clienteId = formData.get('clienteId') as string
    const tipoDocumento = formData.get('tipoDocumento') as string
    const fileName = formData.get('fileName') as string
    const nomeOriginal = formData.get('nomeOriginal') as string
    const tamanho = parseInt(formData.get('tamanho') as string, 10)
    const fileBlob = formData.get('file') as Blob

    if (!fileBlob) {
      throw new Error('Arquivo não fornecido')
    }

    // Converter Blob para Uint8Array
    const arrayBuffer = await fileBlob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Caminho do arquivo
    const filePath = `clientes/${clienteId}/${fileName}`

    // 1. Upload para Storage (usando service role key que ignora RLS)
    const { error: uploadError } = await supabase.storage
      .from('documentos_clientes')
      .upload(filePath, bytes, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`)
    }

    // 2. Salvar referência no banco de dados
    const { error: dbError } = await supabase
      .from('documentos_cliente')
      .upsert({
        cliente_id: clienteId,
        tipo_documento: tipoDocumento,
        nome_original: nomeOriginal,
        caminho_storage: filePath,
        tamanho_bytes: tamanho,
        data_upload: new Date().toISOString(),
      })

    if (dbError) {
      // Se falhar, deletar arquivo do storage
      await supabase.storage
        .from('documentos_clientes')
        .remove([filePath])
      
      throw new Error(`Database error: ${dbError.message}`)
    }

    // 3. Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('documentos_clientes')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: publicUrlData.publicUrl,
        filePath,
        tamanho,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
