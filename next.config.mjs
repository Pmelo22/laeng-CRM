/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Ensure Supabase packages work correctly in Edge Runtime
  serverExternalPackages: ['@supabase/ssr', '@supabase/supabase-js'],
}

export default nextConfig
