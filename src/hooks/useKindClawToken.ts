/**
 * On-chain interaction hooks for $KINDCLAW (Arcade Token)
 */

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { type Address } from 'viem'
import { CONTRACTS } from '@/lib/contracts'

const KINDCLAW_CONTRACT = CONTRACTS.baseSepolia.kindclaw
const COMMENT_CONTRACT = CONTRACTS.baseSepolia.kindredComment

/**
 * Hook for approving $KINDCLAW spending
 */
export function useApproveKindClaw() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (amount: string) => {
    writeContract({
      address: KINDCLAW_CONTRACT.address,
      abi: KINDCLAW_CONTRACT.abi,
      functionName: 'approve',
      args: [
        COMMENT_CONTRACT.address, // spender
        BigInt(amount), // amount in wei
      ],
      chainId: baseSepolia.id,
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for checking $KINDCLAW allowance
 */
export function useKindClawAllowance(owner: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: KINDCLAW_CONTRACT.address,
    abi: KINDCLAW_CONTRACT.abi,
    functionName: 'allowance',
    args: owner ? [owner, COMMENT_CONTRACT.address] : undefined,
    query: {
      enabled: !!owner,
    },
  })

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for checking $KINDCLAW balance
 */
export function useKindClawBalance(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: KINDCLAW_CONTRACT.address,
    abi: KINDCLAW_CONTRACT.abi,
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
 * Hook for claiming faucet (100 $KINDCLAW)
 */
export function useClaimFaucet() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const claimFaucet = () => {
    writeContract({
      address: KINDCLAW_CONTRACT.address,
      abi: KINDCLAW_CONTRACT.abi,
      functionName: 'claimFaucet',
      chainId: baseSepolia.id,
    })
  }

  return {
    claimFaucet,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}
