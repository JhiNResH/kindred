'use client'

import { useState, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { config } from '../config/wagmi'

// Privy App ID - get from https://console.privy.io
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

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

  const content = (
    <WagmiProvider config={config as any}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
      </QueryClientProvider>
    </WagmiProvider>
  )

  // Only wrap with Privy if App ID is configured (supports both 'cl' and 'cm' prefixes)
  if (PRIVY_APP_ID && (PRIVY_APP_ID.startsWith('cl') || PRIVY_APP_ID.startsWith('cm'))) {
    return (
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: 'dark',
            accentColor: '#FF6B35',
            logo: '/kindred-logo.png',
          },
          loginMethods: ['email', 'wallet', 'google', 'twitter'],
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        {content}
      </PrivyProvider>
    )
  }

  return content
}
