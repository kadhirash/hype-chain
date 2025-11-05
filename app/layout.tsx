import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HypeChain - Viral Attribution on Somnia',
  description: 'Track and reward everyone in the share chain, not just the creator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

