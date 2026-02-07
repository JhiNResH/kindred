'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type Address, type WalletClient } from 'viem'
import { useWalletClient, useAccount } from 'wagmi'
import {
  Implementation,
  toMetaMaskSmartAccount,
  type MetaMaskSmartAccount,
  createDelegation,
  type Delegation,
} from '@metamask/smart-accounts-kit'
import {
  publicClient,
  SMART_ACCOUNTS_ENV,
  DEFAULT_AGENT_DELEGATION_SCOPE,
  USDC_ADDRESS,
} from '@/config/smart-accounts'
import { parseUnits } from 'viem'

interface SmartAccountContextType {
  smartAccount: MetaMaskSmartAccount<typeof Implementation.Hybrid> | null
  isLoading: boolean
  error: string | null
  createSmartAccount: () => Promise<void>
  delegation: Delegation | null
  createAgentDelegation: (agentAddress: Address, maxAmount?: string) => Promise<Delegation>
  revokeAgentDelegation: () => Promise<void>
}

const SmartAccountContext = createContext<SmartAccountContextType | undefined>(undefined)

export function SmartAccountProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [smartAccount, setSmartAccount] = useState<MetaMaskSmartAccount<typeof Implementation.Hybrid> | null>(null)
  const [delegation, setDelegation] = useState<Delegation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-create smart account when wallet connects
  useEffect(() => {
    if (address && walletClient && !smartAccount) {
      createSmartAccount()
    }
  }, [address, walletClient])

  const createSmartAccount = async () => {
    if (!address || !walletClient) {
      setError('No wallet connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[SmartAccount] Creating smart account for:', address)

      const account = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [address, [], [], []], // EOA owner, no passkeys
        deploySalt: '0x', // Default salt
        signer: { walletClient },
        environment: SMART_ACCOUNTS_ENV,
      })

      console.log('[SmartAccount] Smart account created:', account.address)
      setSmartAccount(account)
    } catch (err: any) {
      console.error('[SmartAccount] Error creating account:', err)
      setError(err.message || 'Failed to create smart account')
    } finally {
      setIsLoading(false)
    }
  }

  const createAgentDelegation = async (
    agentAddress: Address,
    maxAmount: string = '10' // Default 10 USDC
  ): Promise<Delegation> => {
    if (!address || !smartAccount) {
      throw new Error('Smart account not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[SmartAccount] Creating delegation to agent:', agentAddress)

      const delegation = createDelegation({
        from: smartAccount.address,
        to: agentAddress,
        environment: SMART_ACCOUNTS_ENV,
        scope: {
          type: 'erc20TransferAmount',
          tokenAddress: USDC_ADDRESS,
          maxAmount: parseUnits(maxAmount, 6), // USDC has 6 decimals
        },
      })

      console.log('[SmartAccount] Delegation created:', delegation)
      
      // Sign delegation with smart account
      try {
        const signature = await smartAccount.signDelegation(delegation)
        console.log('[SmartAccount] Delegation signed:', signature)
        
        // Store signed delegation
        const signedDelegation = { ...delegation, signature }
        setDelegation(signedDelegation)
        
        return signedDelegation
      } catch (signError) {
        console.error('[SmartAccount] Failed to sign delegation:', signError)
        // Store unsigned delegation as fallback
        setDelegation(delegation)
        return delegation
      }
    } catch (err: any) {
      console.error('[SmartAccount] Error creating delegation:', err)
      setError(err.message || 'Failed to create delegation')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const revokeAgentDelegation = async () => {
    if (!delegation) {
      console.log('[SmartAccount] No delegation to revoke')
      return
    }

    if (!smartAccount) {
      throw new Error('Smart account not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[SmartAccount] Revoking delegation...')

      // Revoke delegation on-chain
      await smartAccount.revokeDelegation(delegation)

      setDelegation(null)
      console.log('[SmartAccount] ✅ Delegation revoked successfully')
    } catch (err: any) {
      console.error('[SmartAccount] Error revoking delegation:', err)
      setError(err.message || 'Failed to revoke delegation')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const value: SmartAccountContextType = {
    smartAccount,
    isLoading,
    error,
    createSmartAccount,
    delegation,
    createAgentDelegation,
    revokeAgentDelegation,
  }

  return (
    <SmartAccountContext.Provider value={value}>
      {children}
    </SmartAccountContext.Provider>
  )
}

export function useSmartAccount() {
  const context = useContext(SmartAccountContext)
  if (!context) {
    throw new Error('useSmartAccount must be used within SmartAccountProvider')
  }
  return context
}
