'use client'

import { useState, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '../config/wagmi'
import { SmartAccountProvider } from '@/hooks/useSmartAccount'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to prevent SSR issues
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 }
    }
  }), [])
  
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SmartAccountProvider>
          {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
        </SmartAccountProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
