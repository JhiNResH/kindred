/**
 * x402 Payment Protocol Hook
 * 
 * Client-side hook for checking access and paying for gated content
 */

import { useState, useCallback } from 'react'
import { useAccount, useSignMessage, useSendTransaction, useWriteContract } from 'wagmi'
import { parseEther, encodeFunctionData } from 'viem'

// USDC ERC20 ABI (only transfer function)
const ERC20_ABI = [
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
] as const

interface PaymentRequirements {
  accepts: 'ethereum' | 'base'
  chainId: number
  payTo: string
  maxAmountRequired: string
  asset: 'native' | 'USDC'
  assetAddress?: string // Token contract for USDC
  assetDecimals: number
  expires: number
  contentId: string
  contentType: string
}

interface X402State {
  isLoading: boolean
  isUnlocked: boolean
  content: any | null
  requirements: PaymentRequirements | null
  error: string | null
}

export function useX402(contentId: string, contentType: string = 'review') {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()
  
  const [state, setState] = useState<X402State>({
    isLoading: false,
    isUnlocked: false,
    content: null,
    requirements: null,
    error: null,
  })

  /**
   * Check if content is accessible
   */
  const checkAccess = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }))
    
    try {
      const params = new URLSearchParams({
        contentId,
        type: contentType,
        ...(address && { address }),
      })
      
      const res = await fetch(`/api/x402?${params}`)
      const data = await res.json()
      
      if (res.status === 200 && data.status === 'unlocked') {
        setState(s => ({
          ...s,
          isLoading: false,
          isUnlocked: true,
          content: data.content,
        }))
        return { unlocked: true, content: data.content }
      }
      
      if (res.status === 402) {
        setState(s => ({
          ...s,
          isLoading: false,
          isUnlocked: false,
          requirements: data.requirements,
        }))
        return { unlocked: false, requirements: data.requirements }
      }
      
      throw new Error(data.error || 'Failed to check access')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setState(s => ({ ...s, isLoading: false, error: message }))
      return { unlocked: false, error: message }
    }
  }, [contentId, contentType, address])

  /**
   * Pay to unlock content (on-chain transaction)
   * Supports both USDC (ERC20) and native ETH
   */
  const payOnChain = useCallback(async () => {
    if (!isConnected || !address || !state.requirements) {
      setState(s => ({ ...s, error: 'Wallet not connected or no payment requirements' }))
      return { success: false }
    }

    setState(s => ({ ...s, isLoading: true, error: null }))

    try {
      const { payTo, maxAmountRequired, asset, assetAddress } = state.requirements
      let txHash: string
      
      if (asset === 'USDC' && assetAddress) {
        // USDC payment via ERC20 transfer
        txHash = await writeContractAsync({
          address: assetAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [payTo as `0x${string}`, BigInt(maxAmountRequired)],
        })
      } else {
        // Native ETH payment
        txHash = await sendTransactionAsync({
          to: payTo as `0x${string}`,
          value: BigInt(maxAmountRequired),
        })
      }

      // Submit payment proof to backend
      const res = await fetch('/api/x402', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          userAddress: address,
          txHash,
        }),
      })

      const data = await res.json()

      if (data.status === 'unlocked') {
        setState(s => ({
          ...s,
          isLoading: false,
          isUnlocked: true,
          content: data.content,
        }))
        return { success: true, content: data.content, txHash }
      }

      throw new Error(data.error || 'Failed to verify payment')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      setState(s => ({ ...s, isLoading: false, error: message }))
      return { success: false, error: message }
    }
  }, [isConnected, address, state.requirements, contentId, contentType, sendTransactionAsync, writeContractAsync])

  /**
   * Pay with signature (off-chain, for free tier or testnet)
   */
  const payWithSignature = useCallback(async () => {
    if (!isConnected || !address) {
      setState(s => ({ ...s, error: 'Wallet not connected' }))
      return { success: false }
    }

    setState(s => ({ ...s, isLoading: true, error: null }))

    try {
      const message = `Unlock content: ${contentId}`
      const signature = await signMessageAsync({ message })

      const res = await fetch('/api/x402', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          userAddress: address,
          paymentProof: signature,
        }),
      })

      const data = await res.json()

      if (data.status === 'unlocked') {
        setState(s => ({
          ...s,
          isLoading: false,
          isUnlocked: true,
          content: data.content,
        }))
        return { success: true, content: data.content }
      }

      throw new Error(data.error || 'Failed to verify signature')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signature failed'
      setState(s => ({ ...s, isLoading: false, error: message }))
      return { success: false, error: message }
    }
  }, [isConnected, address, contentId, contentType, signMessageAsync])

  /**
   * Format price for display (handles both USDC and ETH)
   */
  const formatPrice = useCallback(() => {
    if (!state.requirements) return '0'
    const amount = BigInt(state.requirements.maxAmountRequired)
    const decimals = state.requirements.assetDecimals
    return (Number(amount) / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 6)
  }, [state.requirements])

  /**
   * Get asset symbol for display
   */
  const getAssetSymbol = useCallback(() => {
    return state.requirements?.asset === 'USDC' ? 'USDC' : 'ETH'
  }, [state.requirements])

  return {
    ...state,
    checkAccess,
    payOnChain,
    payWithSignature,
    formatPrice,
    getAssetSymbol,
  }
}
