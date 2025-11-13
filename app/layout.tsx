import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/src/components/Navigation'
import { WalletProvider } from '@/src/contexts/WalletContext'
import ToastContainer from '@/src/components/Toast'

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
        <WalletProvider>
          <Navigation />
          {children}
          <ToastContainer />
        </WalletProvider>
      </body>
    </html>
  )
}

