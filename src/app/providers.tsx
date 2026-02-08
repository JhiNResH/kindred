'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { useState, useEffect } from 'react'
import { getCircleSDK } from '@/lib/circle'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize Circle SDK on client-side
    try {
      getCircleSDK()
      console.log('[Circle] SDK initialized')
    } catch (error) {
      console.error('[Circle] Failed to initialize:', error)
    }
    setMounted(true)
  }, [])

  // Prevent SSR hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
