/**
 * React hooks for interacting with KindToken (ERC-20)
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { getContract } from '@/lib/contracts'
import { parseUnits } from 'viem'

const chain = baseSepolia
const contract = getContract('baseSepolia', 'kindToken')
const commentContract = getContract('baseSepolia', 'kindredComment')

/**
 * Get token balance
 */
export function useKindBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

/**
 * Get allowance for KindredComment contract
 */
export function useKindAllowance(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'allowance',
    args: owner ? [owner, commentContract.address] : undefined,
    query: {
      enabled: !!owner,
    },
  })
}

/**
 * Approve KindredComment contract to spend tokens
 */
export function useApproveKind() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approve = (amount: bigint) => {
    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'approve',
      args: [commentContract.address, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  }
}

/**
 * Helper: Approve max amount
 */
export function useApproveKindMax() {
  const { approve, ...rest } = useApproveKind()

  const approveMax = () => {
    // Max uint256
    approve(BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))
  }

  return {
    approveMax,
    ...rest,
  }
}

/**
 * Get token decimals
 */
export function useKindDecimals() {
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'decimals',
  })
}

/**
 * Get token symbol
 */
export function useKindSymbol() {
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'symbol',
  })
}

/**
 * Helper: Format token amount
 */
export function formatKind(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals)
  const whole = amount / divisor
  const fraction = amount % divisor
  
  if (fraction === BigInt(0)) {
    return whole.toString()
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0')
  return `${whole}.${fractionStr.slice(0, 4)}` // Show 4 decimal places
}

/**
 * Helper: Parse token amount
 */
export function parseKind(amount: string, decimals: number = 18): bigint {
  return parseUnits(amount, decimals)
}
