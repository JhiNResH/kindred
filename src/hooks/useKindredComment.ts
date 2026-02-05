/**
 * On-chain interaction hooks for KindredComment contract
 */

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { parseEther, type Address } from 'viem'
import { CONTRACTS } from '@/lib/contracts'

const CONTRACT = CONTRACTS.baseSepolia.kindredComment

/**
 * Hook for creating a comment (minting NFT)
 */
export function useCreateComment() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createComment = async (params: {
    targetAddress: Address
    content: string
    stakeAmount: string // Wei string (e.g., "1000000000000000000" for 1 OPEN)
  }) => {
    // TODO: First approve KindToken spending if stakeAmount > 0
    
    writeContract({
      address: CONTRACT.address,
      abi: CONTRACT.abi,
      functionName: 'createComment',
      args: [
        params.targetAddress,
        params.content,
        BigInt(params.stakeAmount),
      ],
      chainId: baseSepolia.id,
    })
  }

  return {
    createComment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for upvoting a comment
 */
export function useUpvoteComment() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const upvote = async (params: {
    tokenId: bigint
    stakeAmount: string // Wei string
  }) => {
    // TODO: First approve KindToken spending if stakeAmount > 0
    
    writeContract({
      address: CONTRACT.address,
      abi: CONTRACT.abi,
      functionName: 'upvote',
      args: [params.tokenId, BigInt(params.stakeAmount)],
      chainId: baseSepolia.id,
    })
  }

  return {
    upvote,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for downvoting a comment
 */
export function useDownvoteComment() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const downvote = async (params: {
    tokenId: bigint
    stakeAmount: string // Wei string
  }) => {
    // TODO: First approve KindToken spending if stakeAmount > 0
    
    writeContract({
      address: CONTRACT.address,
      abi: CONTRACT.abi,
      functionName: 'downvote',
      args: [params.tokenId, BigInt(params.stakeAmount)],
      chainId: baseSepolia.id,
    })
  }

  return {
    downvote,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for reading comment data
 */
export function useGetComment(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT.address,
    abi: CONTRACT.abi,
    functionName: 'getComment',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  })
}

/**
 * Hook for checking net score
 */
export function useGetNetScore(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT.address,
    abi: CONTRACT.abi,
    functionName: 'getNetScore',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  })
}
