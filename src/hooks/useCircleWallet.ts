/**
 * React hooks for Circle Programmable Wallets
 * Client-side wallet integration
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  createUserWallet,
  getUserWalletAddress,
  executeUserTransaction,
  getWalletBalance,
  listUserWallets,
  signMessage,
} from '@/lib/circle/user-wallet'
import { isCircleConfigured } from '@/lib/circle/config'

interface CircleWallet {
  id: string
  address: string
  blockchain: string
  state: string
  createDate: string
}

interface UseCircleWalletReturn {
  // State
  wallet: CircleWallet | null
  wallets: CircleWallet[]
  loading: boolean
  error: string | null
  balance: string
  
  // Actions
  createWallet: (username: string) => Promise<void>
  loadWallets: (userId: string) => Promise<void>
  executeTransaction: (tx: { to: string; data: string; value?: string }) => Promise<string | null>
  sign: (message: string) => Promise<string | null>
  refreshBalance: () => Promise<void>
  
  // Status
  isConfigured: boolean
}

/**
 * Hook for managing Circle user wallets
 * @param userId - User identifier (address or username)
 */
export function useCircleWallet(userId?: string): UseCircleWalletReturn {
  const [wallet, setWallet] = useState<CircleWallet | null>(null)
  const [wallets, setWallets] = useState<CircleWallet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')
  
  const isConfigured = isCircleConfigured()

  // Load user's wallets
  const loadWallets = useCallback(async (refId: string) => {
    if (!isConfigured) {
      setError('Circle not configured')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await listUserWallets(refId)
      
      if (result.success) {
        setWallets(result.wallets as CircleWallet[])
        
        // Set first wallet as active
        if (result.wallets.length > 0) {
          setWallet(result.wallets[0] as CircleWallet)
        }
      } else {
        setError('Failed to load wallets')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [isConfigured])

  // Create a new wallet
  const createWallet = useCallback(async (username: string) => {
    if (!isConfigured) {
      setError('Circle not configured')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await createUserWallet(username)
      
      if (result.success && result.wallet) {
        setWallet(result.wallet as CircleWallet)
        setWallets(prev => [...prev, result.wallet as CircleWallet])
      } else {
        setError(result.error || 'Failed to create wallet')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [isConfigured])

  // Execute a transaction
  const executeTransaction = useCallback(async (tx: {
    to: string
    data: string
    value?: string
  }): Promise<string | null> => {
    if (!wallet) {
      setError('No wallet connected')
      return null
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await executeUserTransaction(wallet.id, tx)
      
      if (result.success) {
        // Refresh balance after transaction
        await refreshBalance()
        return result.txHash || null
      } else {
        setError(result.error || 'Transaction failed')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [wallet])

  // Sign a message
  const sign = useCallback(async (message: string): Promise<string | null> => {
    if (!wallet) {
      setError('No wallet connected')
      return null
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await signMessage(wallet.id, message)
      
      if (result.success) {
        return result.signature || null
      } else {
        setError(result.error || 'Signing failed')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [wallet])

  // Refresh wallet balance
  const refreshBalance = useCallback(async () => {
    if (!wallet) return
    
    try {
      const newBalance = await getWalletBalance(wallet.id)
      setBalance(newBalance)
    } catch (err) {
      console.error('Failed to refresh balance:', err)
    }
  }, [wallet])

  // Load wallets on mount if userId provided
  useEffect(() => {
    if (userId && isConfigured) {
      loadWallets(userId)
    }
  }, [userId, isConfigured, loadWallets])

  // Refresh balance periodically
  useEffect(() => {
    if (!wallet) return
    
    refreshBalance()
    const interval = setInterval(refreshBalance, 10000) // Every 10s
    
    return () => clearInterval(interval)
  }, [wallet, refreshBalance])

  return {
    wallet,
    wallets,
    loading,
    error,
    balance,
    createWallet,
    loadWallets,
    executeTransaction,
    sign,
    refreshBalance,
    isConfigured,
  }
}

/**
 * Hook for gasless transactions (with Paymaster)
 */
export function useGaslessTransaction() {
  const [sponsoring, setSponsoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const executeGasless = useCallback(async (params: {
    walletId: string
    to: string
    data: string
    operation: string
  }) => {
    setSponsoring(true)
    setError(null)
    
    try {
      // This would call the paymaster API endpoint we'll create
      const response = await fetch('/api/circle/gasless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      
      if (!response.ok) {
        throw new Error('Gasless transaction failed')
      }
      
      const result = await response.json()
      return result.txHash
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setSponsoring(false)
    }
  }, [])
  
  return {
    executeGasless,
    sponsoring,
    error,
  }
}
