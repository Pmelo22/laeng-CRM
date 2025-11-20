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

    // Receber dados do request
    const { 
      caminhoStorage,
      clienteId,
      tipoDocumento
    } = await req.json()

    if (!caminhoStorage) {
      throw new Error('Caminho do arquivo não fornecido')
    }

    // 1. Deletar do Storage (usando service role key que ignora RLS)
    const { error: storageError } = await supabase.storage
      .from('documentos_clientes')
      .remove([caminhoStorage])

    if (storageError) {
      console.error('Erro ao deletar do Storage:', storageError)
      throw new Error(`Erro ao deletar arquivo: ${storageError.message}`)
    }

    // 2. Deletar referência do banco (opcional - pode ser feito pelo client também)
    if (clienteId && tipoDocumento) {
      const { error: dbError } = await supabase
        .from('documentos_cliente')
        .delete()
        .eq('cliente_id', clienteId)
        .eq('tipo_documento', tipoDocumento)

      if (dbError) {
        console.error('Erro ao deletar do banco:', dbError)
        // Não falha a requisição se banco falhar, pois arquivo já foi deletado
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Arquivo deletado com sucesso'
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
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
