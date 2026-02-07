#!/usr/bin/env node
/**
 * Circle Wallet Migration Script
 * 
 * Automates migration from RainbowKit to Circle Programmable Wallets
 * 
 * Usage:
 *   node scripts/migrate-to-circle.js
 * 
 * Prerequisites:
 *   - Circle API Key in .env.local
 *   - NEXT_PUBLIC_CIRCLE_APP_ID in .env.local
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔄 Starting Circle Wallet Migration...\n')

// Step 1: Check environment variables
console.log('Step 1: Checking environment variables...')
const envPath = path.join(__dirname, '../.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found!')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
if (!envContent.includes('NEXT_PUBLIC_CIRCLE_APP_ID')) {
  console.error('❌ Missing NEXT_PUBLIC_CIRCLE_APP_ID in .env.local')
  process.exit(1)
}
if (!envContent.includes('CIRCLE_API_KEY')) {
  console.error('❌ Missing CIRCLE_API_KEY in .env.local')
  process.exit(1)
}
console.log('✅ Environment variables OK\n')

// Step 2: Uninstall RainbowKit
console.log('Step 2: Uninstalling RainbowKit...')
try {
  execSync('npm uninstall @rainbow-me/rainbowkit', { stdio: 'inherit' })
  console.log('✅ RainbowKit uninstalled\n')
} catch (error) {
  console.error('❌ Failed to uninstall RainbowKit')
  process.exit(1)
}

// Step 3: Install Circle SDKs
console.log('Step 3: Installing Circle SDKs...')
try {
  execSync('npm install @circle-fin/user-controlled-wallets @circle-fin/w3s-pw-web-sdk', { 
    stdio: 'inherit' 
  })
  console.log('✅ Circle SDKs installed\n')
} catch (error) {
  console.error('❌ Failed to install Circle SDKs')
  process.exit(1)
}

// Step 4: Create Circle wallet library
console.log('Step 4: Creating Circle wallet library...')
const circleWalletPath = path.join(__dirname, '../src/lib/circle-wallet.ts')
const circleWalletContent = `/**
 * Circle Programmable Wallets Integration
 * 
 * User-Controlled Wallets: Email/Passkey login for users
 * Developer-Controlled Wallets: API operations for agents
 */

// Client-side SDK for users
export function initCircleSDK() {
  const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID
  if (!appId) throw new Error('Missing NEXT_PUBLIC_CIRCLE_APP_ID')
  
  // Dynamic import to avoid SSR issues
  return import('@circle-fin/w3s-pw-web-sdk').then(({ W3SSdk }) => {
    return new W3SSdk({ appId })
  })
}

// Server-side client for agents (use in API routes only)
export async function getCircleClient() {
  const apiKey = process.env.CIRCLE_API_KEY
  if (!apiKey) throw new Error('Missing CIRCLE_API_KEY')
  
  const { initiateDeveloperControlledWalletsClient } = await import(
    '@circle-fin/developer-controlled-wallets'
  )
  
  return initiateDeveloperControlledWalletsClient({ apiKey })
}
`
fs.writeFileSync(circleWalletPath, circleWalletContent)
console.log('✅ Created lib/circle-wallet.ts\n')

// Step 5: Create Circle wallet hook
console.log('Step 5: Creating Circle wallet hook...')
const circleHookPath = path.join(__dirname, '../src/hooks/useCircleWallet.ts')
const circleHookContent = `'use client'

import { useState, useEffect } from 'react'
import { initCircleSDK } from '@/lib/circle-wallet'

export function useCircleWallet() {
  const [sdk, setSdk] = useState<any>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    initCircleSDK().then(setSdk)
  }, [])

  const connect = async () => {
    if (!sdk) return
    setIsLoading(true)
    
    try {
      await sdk.execute('SIGN_IN', { preferredProvider: 'email' })
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

  return { address, isConnected, isLoading, connect, disconnect, sdk }
}
`
fs.writeFileSync(circleHookPath, circleHookContent)
console.log('✅ Created hooks/useCircleWallet.ts\n')

// Step 6: Summary
console.log('✅ Migration Complete!\n')
console.log('📋 Next Steps:')
console.log('1. Update WalletButton.tsx to use useCircleWallet()')
console.log('2. Update providers.tsx to remove RainbowKit')
console.log('3. Replace wagmi useAccount() with useCircleWallet()')
console.log('4. Test: npm run dev')
console.log('5. Build: npm run build\n')
console.log('📚 See CIRCLE_MIGRATION_PLAN.md for details')
