/**
 * Configuração de variáveis de ambiente
 * 
 * IMPORTANTE: Variáveis NEXT_PUBLIC_* são injetadas durante o build
 * e ficam disponíveis tanto no servidor quanto no cliente.
 */

// Para o cliente, as variáveis são injetadas diretamente pelo Next.js
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
} as const;

// Validação em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  if (!env.supabase.url || !env.supabase.anonKey) {
    console.error(
      '❌ Missing Supabase environment variables!\n' +
      'Please check your .env file:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
}
