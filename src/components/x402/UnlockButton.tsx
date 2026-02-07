'use client'

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { parseUnits, encodeFunctionData } from 'viem'
import { Loader2, Lock, Sparkles, Check } from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'

interface UnlockButtonProps {
  contentId: string
  contentType: 'review' | 'analysis' | 'gourmet-insight'
  price: string // USDC amount in human-readable format (e.g., "0.10")
  onUnlock: (data: any) => void
  className?: string
}

export function UnlockButton({
  contentId,
  contentType,
  price,
  onUnlock,
  className = '',
}: UnlockButtonProps) {
  const { ready, authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [status, setStatus] = useState<'idle' | 'paying' | 'unlocking' | 'unlocked'>('idle')
  const [error, setError] = useState<string | null>(null)

  // USDC contract address (Base Sepolia)
  const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  const TREASURY_ADDRESS = CONTRACTS.baseSepolia.treasury

  const handleUnlock = async () => {
    console.log('[UnlockButton] Click detected', {
      authenticated,
      ready,
      walletsCount: wallets.length,
      status,
    })

    if (!ready) {
      console.log('[UnlockButton] Privy not ready yet')
      setError('Wallet not ready. Please wait...')
      return
    }

    if (!authenticated) {
      console.log('[UnlockButton] Not authenticated, triggering login')
      login()
      return
    }

    if (!wallets.length) {
      console.log('[UnlockButton] No wallets connected')
      setError('No wallet connected. Please connect wallet first.')
      return
    }

    setStatus('paying')
    setError(null)

    try {
      const wallet = wallets[0]
      const address = wallet.address as `0x${string}`

      // Parse USDC amount (6 decimals)
      const usdcAmount = parseUnits(price, 6)

      // Encode USDC transfer: transfer(address to, uint256 amount)
      const data = encodeFunctionData({
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, usdcAmount],
      })

      // Send USDC transaction
      console.log('[UnlockButton] Sending USDC payment:', {
        from: address,
        to: USDC_ADDRESS,
        amount: price,
        treasury: TREASURY_ADDRESS,
      })

      const txHash = await wallet.sendTransaction({
        to: USDC_ADDRESS,
        data,
        value: BigInt(0), // No ETH value for ERC-20 transfer
      })

      console.log('[UnlockButton] Payment sent:', txHash)

      // Verify payment and unlock content
      setStatus('unlocking')

      const response = await fetch('/api/x402', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          userAddress: address,
          txHash,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unlock content')
      }

      const result = await response.json()
      console.log('[UnlockButton] Content unlocked:', result)

      setStatus('unlocked')
      onUnlock(result.content)
    } catch (err: any) {
      console.error('[UnlockButton] Error:', err)
      setError(err.message || 'Payment failed')
      setStatus('idle')
    }
  }

  const buttonText = {
    idle: `Unlock for $${price} USDC`,
    paying: 'Sending payment...',
    unlocking: 'Verifying...',
    unlocked: 'Unlocked!',
  }[status]

  const buttonIcon = {
    idle: Lock,
    paying: Loader2,
    unlocking: Loader2,
    unlocked: Check,
  }[status]

  const Icon = buttonIcon

  return (
    <div className="space-y-2">
      <button
        onClick={handleUnlock}
        disabled={status === 'paying' || status === 'unlocking' || status === 'unlocked'}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
          font-medium text-white transition-all
          ${
            status === 'idle'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl cursor-pointer'
              : status === 'unlocked'
              ? 'bg-green-500 cursor-default'
              : 'bg-gray-600 cursor-wait'
          }
          ${status === 'paying' || status === 'unlocking' ? 'opacity-75' : ''}
          ${className}
        `}
      >
        <Icon className={`w-5 h-5 ${status === 'paying' || status === 'unlocking' ? 'animate-spin' : ''}`} />
        <span>{buttonText}</span>
      </button>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {status === 'idle' && (
        <div className="text-xs text-gray-400 text-center">
          Payment processed via USDC on Base
        </div>
      )}
    </div>
  )
}
