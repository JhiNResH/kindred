/**
 * On-chain interaction hooks for KindToken (ERC20)
 */

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { type Address } from 'viem'
import { CONTRACTS } from '@/lib/contracts'

const TOKEN_CONTRACT = CONTRACTS.baseSepolia.kindToken
const COMMENT_CONTRACT = CONTRACTS.baseSepolia.kindredComment

/**
 * Hook for approving KindToken spending
 */
export function useApproveKindToken() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (amount: string) => {
    writeContract({
      address: TOKEN_CONTRACT.address,
      abi: TOKEN_CONTRACT.abi,
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
 * Hook for checking allowance
 */
export function useKindTokenAllowance(owner: Address | undefined) {
  return useReadContract({
    address: TOKEN_CONTRACT.address,
    abi: TOKEN_CONTRACT.abi,
    functionName: 'allowance',
    args: owner ? [owner, COMMENT_CONTRACT.address] : undefined,
    query: {
      enabled: !!owner,
    },
  })
}

/**
 * Hook for checking balance
 */
export function useKindTokenBalance(address: Address | undefined) {
  return useReadContract({
    address: TOKEN_CONTRACT.address,
    abi: TOKEN_CONTRACT.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}
