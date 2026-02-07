# 🔄 Circle Wallet Migration Plan

**Date:** 2026-02-07  
**Status:** ⏸️ Waiting for Circle API Key  
**Agent:** Steve Jobs 🍎

---

## 🎯 Goal

Replace RainbowKit with Circle Programmable Wallets:
- **Users:** Circle User-Controlled Wallets (Email/Passkey login)
- **Agents:** Circle Developer-Controlled Wallets (API operations)

---

## 📚 Resources

- **Docs:** https://developers.circle.com/wallets
- **SDK:** `@circle-fin/user-controlled-wallets`
- **Console:** https://console.circle.com/

---

## 🔑 Prerequisites

### 1. Circle Developer Account
- [ ] Sign up at https://console.circle.com/
- [ ] Create new App
- [ ] Get App ID
- [ ] Get API Key

### 2. Environment Variables Needed
```env
# .env.local
NEXT_PUBLIC_CIRCLE_APP_ID=your_app_id_here
CIRCLE_API_KEY=your_api_key_here
```

---

## 📦 Step 1: Install Circle SDK

```bash
# Remove RainbowKit
npm uninstall @rainbow-me/rainbowkit

# Install Circle SDK
npm install @circle-fin/user-controlled-wallets
npm install @circle-fin/w3s-pw-web-sdk  # For web integration
```

---

## 🗑️ Step 2: Remove RainbowKit Files

Files to delete/modify:
- `src/config/wagmi.ts` (partial cleanup)
- `src/components/WalletProviders.tsx` (complete rewrite)
- All `import { ConnectButton } from '@rainbow-me/rainbowkit'`

---

## 🔧 Step 3: Create Circle Provider

### `src/lib/circle-wallet.ts`

```typescript
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'
import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'

// Server-side: Developer-Controlled Wallets (for agents)
export function getCircleClient() {
  const apiKey = process.env.CIRCLE_API_KEY
  if (!apiKey) throw new Error('Missing CIRCLE_API_KEY')
  
  return initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET, // For signing
  })
}

// Client-side: User-Controlled Wallets (for users)
export function initCircleSDK() {
  const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID
  if (!appId) throw new Error('Missing NEXT_PUBLIC_CIRCLE_APP_ID')
  
  return new W3SSdk({
    appId,
  })
}
```

### `src/hooks/useCircleWallet.ts`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { initCircleSDK } from '@/lib/circle-wallet'
import type { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'

export function useCircleWallet() {
  const [sdk, setSdk] = useState<W3SSdk | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const sdk = initCircleSDK()
    setSdk(sdk)
  }, [])

  const connect = async () => {
    if (!sdk) return
    setIsLoading(true)
    
    try {
      // Circle's social login (Email/Google/Apple)
      await sdk.execute('SIGN_IN', {
        preferredProvider: 'email', // or 'google', 'apple'
      })
      
      const wallets = await sdk.getWallets()
      if (wallets.length > 0) {
        setAddress(wallets[0].address)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Circle connect failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    if (!sdk) return
    await sdk.execute('SIGN_OUT')
    setAddress(null)
    setIsConnected(false)
  }

  const signMessage = async (message: string) => {
    if (!sdk || !address) return null
    
    const result = await sdk.execute('SIGN_MESSAGE', {
      message,
    })
    
    return result.signature
  }

  return {
    address,
    isConnected,
    isLoading,
    connect,
    disconnect,
    signMessage,
    sdk,
  }
}
```

---

## 🎨 Step 4: Update WalletButton

### `src/components/WalletButton.tsx`

```typescript
'use client'

import { useCircleWallet } from '@/hooks/useCircleWallet'
import { Wallet, LogOut } from 'lucide-react'

export function WalletButton() {
  const { address, isConnected, isLoading, connect, disconnect } = useCircleWallet()

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isLoading}
        className="px-5 py-2.5 rounded-lg bg-[#ded4e8] hover:bg-[#c4b9d3] text-black font-bold"
      >
        {isLoading ? 'Connecting...' : 'Login with Circle'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#2a2a2e] rounded-lg">
        <Wallet className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-white font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>
      <button
        onClick={disconnect}
        className="p-2 bg-[#111113] border border-[#2a2a2e] rounded-lg hover:bg-red-500/10"
      >
        <LogOut className="w-4 h-4 text-red-400" />
      </button>
    </div>
  )
}
```

---

## 🔌 Step 5: Update Providers

### `src/app/providers.tsx`

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { initCircleSDK } from '@/lib/circle-wallet'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize Circle SDK on mount
    initCircleSDK()
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## 🤖 Step 6: Agent Wallet Integration

### `src/lib/agent-wallet.ts`

```typescript
import { getCircleClient } from './circle-wallet'

/**
 * Create wallet for an AI agent
 */
export async function createAgentWallet(agentId: string) {
  const client = getCircleClient()
  
  const wallet = await client.createWallets({
    accountType: 'SCA', // Smart Contract Account
    blockchains: ['BASE-SEPOLIA'],
    count: 1,
    walletSetId: agentId, // Use agentId as walletSetId
  })
  
  return {
    id: wallet.data.wallets[0].id,
    address: wallet.data.wallets[0].address,
    agentId,
  }
}

/**
 * Send transaction from agent wallet
 */
export async function sendAgentTransaction(
  walletId: string,
  to: string,
  amount: string
) {
  const client = getCircleClient()
  
  const result = await client.createTransaction({
    walletId,
    blockchain: 'BASE-SEPOLIA',
    transaction: {
      to,
      value: amount,
    },
  })
  
  return result.data.id // Transaction ID
}
```

---

## 🧪 Step 7: Testing Checklist

- [ ] User can login with email
- [ ] User can login with Google
- [ ] Wallet address displayed correctly
- [ ] Can sign messages
- [ ] Can send transactions
- [ ] Can disconnect
- [ ] Agent wallet creation works
- [ ] Agent can send transactions

---

## 📋 Migration Checklist

### Phase 1: Setup (Waiting for API Key)
- [ ] Sign up Circle Developer Console
- [ ] Create App
- [ ] Get App ID and API Key
- [ ] Add to `.env.local`

### Phase 2: Installation
- [ ] Uninstall RainbowKit
- [ ] Install Circle SDKs
- [ ] Clear node_modules cache

### Phase 3: Code Changes
- [ ] Create `lib/circle-wallet.ts`
- [ ] Create `hooks/useCircleWallet.ts`
- [ ] Update `components/WalletButton.tsx`
- [ ] Update `app/providers.tsx`
- [ ] Remove RainbowKit imports
- [ ] Update all wallet hooks

### Phase 4: Testing
- [ ] Test user login
- [ ] Test wallet display
- [ ] Test transactions
- [ ] Test agent wallets

### Phase 5: Cleanup
- [ ] Remove unused RainbowKit files
- [ ] Update documentation
- [ ] Test production build

---

## ⚠️ Breaking Changes

### Components Affected
- `WalletButton.tsx` — Complete rewrite
- `providers.tsx` — Remove RainbowKit provider
- All components using `useAccount()` from wagmi

### Hooks Affected
- Replace `useAccount()` → `useCircleWallet()`
- Replace `useConnect()` → `useCircleWallet().connect()`
- Replace `useDisconnect()` → `useCircleWallet().disconnect()`

### New Features
✅ Email login (no wallet extension needed)
✅ Social login (Google, Apple)
✅ Passkey support
✅ Agent wallets via API
✅ Better UX for non-crypto users

---

## 🚀 Execution Plan

**When API Key arrives:**

```bash
# 1. Add to .env.local
echo "NEXT_PUBLIC_CIRCLE_APP_ID=..." >> .env.local
echo "CIRCLE_API_KEY=..." >> .env.local

# 2. Install
npm uninstall @rainbow-me/rainbowkit
npm install @circle-fin/user-controlled-wallets @circle-fin/w3s-pw-web-sdk

# 3. Execute migration script
node scripts/migrate-to-circle.js

# 4. Test
npm run dev

# 5. Build
npm run build
```

**Estimated Time:** 2-3 hours

---

## 📞 Next Steps

1. **JhiNResH:** Sign up Circle Developer Console
2. **JhiNResH:** Provide App ID + API Key
3. **Steve:** Execute migration immediately
4. **Team:** Test all wallet features
5. **Ship:** Deploy to production

---

**Status:** ⏸️ **Ready to execute when API Key arrives**

**Steve Jobs 🍎**  
*Circle Migration Plan - 2026-02-07 12:20 PST*
