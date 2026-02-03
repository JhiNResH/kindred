'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { PrivyProvider } from '@privy-io/react-auth'
import { config } from '../config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// Privy App ID - get from https://console.privy.io
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clxxxxxxxxxxxxxxxxxx'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // Customize Privy appearance
        appearance: {
          theme: 'dark',
          accentColor: '#FF6B35',
          logo: '/kindred-logo.png',
        },
        // Login methods
        loginMethods: ['email', 'wallet', 'google', 'twitter'],
        // Embedded wallets (auto-create wallet for email/social users)
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme({
            accentColor: '#FF6B35',
            accentColorForeground: 'white',
          })}>
            {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
