import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/src/components/Navigation'

export const metadata: Metadata = {
  title: 'HypeChain - Proof-of-Hype Viral Tracking',
  description: 'Reward everyone who makes content go viral. Built on Somnia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}

