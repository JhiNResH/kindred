'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseUnits, encodeFunctionData } from 'viem'
import { Loader2, Lock, Check } from 'lucide-react'
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
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [status, setStatus] = useState<'idle' | 'paying' | 'unlocking' | 'unlocked'>('idle')
  const [error, setError] = useState<string | null>(null)

  // USDC contract address (Base Sepolia)
  const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`
  const TREASURY_ADDRESS = CONTRACTS.baseSepolia.treasury

  const { sendTransaction, data: txHash } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const handleUnlock = async () => {
    if (!isConnected) {
      openConnectModal?.()
      return
    }

    if (!address) {
      setError('No wallet connected')
      return
    }

    console.log('[UnlockButton] Debug info:', {
      userAddress: address,
      isConnected,
      treasuryAddress: TREASURY_ADDRESS,
      usdcAddress: USDC_ADDRESS,
      addressMatch: address === TREASURY_ADDRESS
    })

    // Dev mode: Skip payment if user is Treasury (testing scenario)
    if (address === TREASURY_ADDRESS) {
      console.log('[UnlockButton] 🔧 Dev mode: Skipping payment (user is Treasury)')
      setStatus('unlocking')
      
      try {
        const response = await fetch('/api/x402', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId,
            contentType,
            userAddress: address,
            txHash: '0xDEV_MODE_SKIP_PAYMENT', // Special flag for dev mode
            amount: price,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to unlock content')
        }

        const data = await response.json()
        console.log('[UnlockButton] ✅ Content unlocked (dev mode)')
        setStatus('unlocked')
        onUnlock(data)
      } catch (err: any) {
        console.error('[UnlockButton] Dev mode unlock error:', err)
        setError(err.message || 'Failed to unlock content')
        setStatus('idle')
      }
      return
    }

    setStatus('paying')
    setError(null)

    try {
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

      console.log('[UnlockButton] Sending USDC payment:', {
        from: address,
        to: USDC_ADDRESS,
        amount: price,
        treasury: TREASURY_ADDRESS,
      })

      // Send USDC transaction
      sendTransaction({
        to: USDC_ADDRESS,
        data,
        value: BigInt(0), // No ETH value for ERC-20 transfer
      })

      // Wait for confirmation (handled by useWaitForTransactionReceipt)

    } catch (err: any) {
      console.error('[UnlockButton] Error:', err)
      setError(err.message || 'Payment failed')
      setStatus('idle')
    }
  }

  // Handle transaction confirmation
  useState(() => {
    if (txSuccess && txHash && status === 'paying') {
      verifyAndUnlock(txHash)
    }
  })

  async function verifyAndUnlock(hash: `0x${string}`) {
    setStatus('unlocking')

    try {
      console.log('[UnlockButton] Payment confirmed:', hash)

      // Verify payment and unlock content
      const response = await fetch('/api/x402', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          userAddress: address,
          txHash: hash,
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
      console.error('[UnlockButton] Unlock error:', err)
      setError(err.message || 'Unlock failed')
      setStatus('idle')
    }
  }

  const buttonText = {
    idle: `Unlock for $${price} USDC`,
    paying: isConfirming ? 'Confirming...' : 'Sending payment...',
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
        disabled={status !== 'idle'}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
          font-medium text-white transition-all
          ${
            status === 'idle'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              : status === 'unlocked'
              ? 'bg-green-500'
              : 'bg-gray-600 cursor-not-allowed'
          }
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
