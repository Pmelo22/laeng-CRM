import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
// @ts-expect-error: allow side-effect import of global CSS without type declarations
import './globals.css'

export const metadata: Metadata = {
  title: 'Setor Escritório - Sistema de Gestão',
  description: 'Sistema de gestão para escritório de engenharia',
  generator: 'Next.js',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
