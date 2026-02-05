/**
 * React hooks for interacting with KindredComment contract
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { getContract } from '@/lib/contracts'
import { useState } from 'react'

const chain = baseSepolia
const contract = getContract('baseSepolia', 'kindredComment')

/**
 * Read comment data
 */
export function useComment(tokenId: bigint | undefined) {
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getComment',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  })
}

/**
 * Create a new comment
 */
export function useCreateComment() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const createComment = async (
    projectId: string,
    contentHash: string,
    premiumHash: string = '',
    unlockPrice: bigint = BigInt(0),
    extraStake: bigint = BigInt(0)
  ) => {
    // Convert projectId to bytes32
    const projectIdBytes32 = `0x${Buffer.from(projectId).toString('hex').padEnd(64, '0')}` as `0x${string}`

    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'createComment',
      args: [projectIdBytes32, contentHash, premiumHash, unlockPrice, extraStake],
    })
  }

  return {
    createComment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  }
}

/**
 * Upvote a comment
 */
export function useUpvote() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const upvote = (tokenId: bigint, amount: bigint) => {
    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'upvote',
      args: [tokenId, amount],
    })
  }

  return {
    upvote,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  }
}

/**
 * Downvote a comment
 */
export function useDownvote() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const downvote = (tokenId: bigint, amount: bigint) => {
    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'downvote',
      args: [tokenId, amount],
    })
  }

  return {
    downvote,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  }
}

/**
 * Unlock premium content
 */
export function useUnlockPremium() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const unlock = (tokenId: bigint) => {
    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'unlockPremium',
      args: [tokenId],
    })
  }

  return {
    unlock,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  }
}

/**
 * Get net score (upvotes - downvotes)
 */
export function useNetScore(tokenId: bigint | undefined) {
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getNetScore',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  })
}

/**
 * Check if user can access premium content
 */
export function useCanAccessPremium(tokenId: bigint | undefined) {
  const { address } = useAccount()

  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'canAccessPremium',
    args: tokenId !== undefined && address ? [tokenId, address] : undefined,
    query: {
      enabled: tokenId !== undefined && !!address,
    },
  })
}

/**
 * Get comments for a project
 */
export function useProjectComments(projectId: string | undefined) {
  const projectIdBytes32 = projectId
    ? (`0x${Buffer.from(projectId).toString('hex').padEnd(64, '0')}` as `0x${string}`)
    : undefined

  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getProjectComments',
    args: projectIdBytes32 ? [projectIdBytes32] : undefined,
    query: {
      enabled: !!projectIdBytes32,
    },
  })
}

/**
 * Get comments by a user
 */
export function useUserComments(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getUserComments',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}
