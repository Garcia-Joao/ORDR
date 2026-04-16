import type { Metadata } from 'next'
import LayoutWrapper from '@/components/layout-wrapper'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Ordr - Point of Sale',
  description: 'Fast order taking and ticket printing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}