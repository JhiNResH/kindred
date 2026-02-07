/**
 * USDC Token hooks for Base Sepolia
 */

import { useReadContract } from 'wagmi'
import { type Address } from 'viem'

// USDC on Base Sepolia (official testnet address)
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address

// Standard ERC20 ABI (balanceOf only)
const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

/**
 * Hook for reading USDC balance
 */
export function useUSDCBalance(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    balance: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Get USDC decimals (always 6 for USDC)
 */
export function getUSDCDecimals() {
  return 6
}

/**
 * Format USDC amount with decimals
 */
export function formatUSDC(amount: bigint | undefined): string {
  if (!amount) return '0.00'
  const decimals = getUSDCDecimals()
  const divisor = BigInt(10 ** decimals)
  const dollars = Number(amount / divisor)
  const cents = Number((amount % divisor) * BigInt(100) / divisor)
  return `${dollars}.${cents.toString().padStart(2, '0')}`
}

export const USDC = {
  address: USDC_ADDRESS,
  decimals: getUSDCDecimals(),
  symbol: 'USDC',
  name: 'USD Coin',
} as const
