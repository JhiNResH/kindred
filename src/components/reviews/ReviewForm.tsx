'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { useIsMounted } from '@/components/layout/ClientOnly'
import { useCreateComment } from '@/hooks/useKindredComment'
import { useApproveKindClaw, useKindClawAllowance } from '@/hooks/useKindClawToken'
import { type Address } from 'viem'

type Category = 'k/memecoin' | 'k/defi' | 'k/perp-dex' | 'k/ai'

interface ReviewFormData {
  targetAddress: string
  rating: number
  content: string
  category: Category
  stakeAmount: string
  predictedRank?: number // Opinion market: where will this rank?
}

const CATEGORIES: { value: Category; label: string; icon: string; description: string }[] = [
  { value: 'k/memecoin', label: 'Memecoins', icon: '🐸', description: 'PEPE, DOGE, WIF...' },
  { value: 'k/defi', label: 'DeFi', icon: '🏦', description: 'Aave, Compound, Uniswap...' },
  { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈', description: 'GMX, dYdX, Hyperliquid...' },
  { value: 'k/ai', label: 'AI Agents', icon: '🤖', description: 'AI16Z, Virtual, Griffain...' },
]

const STAKE_OPTIONS = [
  { value: '0', label: 'No Stake', description: 'Basic review' },
  { value: '1000000000000000000', label: '1 OPEN', description: '+10% reputation' },
  { value: '5000000000000000000', label: '5 OPEN', description: '+25% reputation' },
  { value: '10000000000000000000', label: '10 OPEN', description: '+50% reputation' },
]

export function ReviewForm() {
  // === ALL HOOKS MUST BE AT THE TOP, UNCONDITIONALLY ===
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  
  // State hooks
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [approvalDone, setApprovalDone] = useState(false)
  
  const [formData, setFormData] = useState<ReviewFormData>({
    targetAddress: '',
    rating: 0,
    content: '',
    category: 'k/defi',
    stakeAmount: '0',
    predictedRank: undefined,
  })

  // Ref to track if we've already triggered comment creation after approval
  const commentTriggeredRef = useRef(false)

  // On-chain hooks - MUST be called unconditionally
  const { createComment, hash: commentHash, isPending: isCreating, isConfirming: isConfirmingComment, isSuccess: commentSuccess, isError: commentError, error: commentErrorMsg } = useCreateComment()
  const { approve, hash: approveHash, isPending: isApproving, isConfirming: isConfirmingApprove, isSuccess: approveSuccess } = useApproveKindToken()
  const { data: allowance } = useKindTokenAllowance(address)

  // Check if approval is needed
  useEffect(() => {
    if (formData.stakeAmount !== '0' && allowance !== undefined && allowance !== null) {
      const stakeAmountBigInt = BigInt(formData.stakeAmount)
      const allowanceBigInt = BigInt(allowance.toString())
      setNeedsApproval(allowanceBigInt < stakeAmountBigInt)
    } else {
      setNeedsApproval(false)
    }
  }, [formData.stakeAmount, allowance])

  // Handle approval success
  useEffect(() => {
    if (approveSuccess && !approvalDone) {
      setApprovalDone(true)
      setNeedsApproval(false)
    }
  }, [approveSuccess, approvalDone])

  // Handle comment creation success
  useEffect(() => {
    if (commentSuccess && commentHash) {
      setTxHash(commentHash)
      setSubmitted(true)
      setIsSubmitting(false)
      commentTriggeredRef.current = false
    }
  }, [commentSuccess, commentHash])

  // Handle errors
  useEffect(() => {
    if (commentError && commentErrorMsg) {
      setError(`Transaction failed: ${commentErrorMsg.message}`)
      setIsSubmitting(false)
      commentTriggeredRef.current = false
    }
  }, [commentError, commentErrorMsg])

  // Handle approval completion - auto-proceed to comment creation
  useEffect(() => {
    if (approvalDone && isSubmitting && !commentSuccess && formData.targetAddress && !commentTriggeredRef.current) {
      commentTriggeredRef.current = true
      // Approval done, now create comment
      try {
        createComment({
          targetAddress: formData.targetAddress as Address,
          content: formData.content,
          stakeAmount: formData.stakeAmount,
        })
      } catch (err: any) {
        setError(err?.message || 'Comment creation failed')
        setIsSubmitting(false)
        commentTriggeredRef.current = false
      }
    }
  }, [approvalDone, isSubmitting, commentSuccess, formData.targetAddress, formData.content, formData.stakeAmount, createComment])

  // === EARLY RETURNS ONLY AFTER ALL HOOKS ===
  
  // Prevent SSR hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    commentTriggeredRef.current = false
    
    // Validation
    if (!formData.targetAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid Ethereum address')
      return
    }
    if (formData.rating === 0) {
      setError('Please select a rating')
      return
    }
    if (formData.content.length < 10) {
      setError('Review must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Step 1: Approve if needed (for staking)
      if (needsApproval && !approvalDone) {
        approve(formData.stakeAmount)
        return // Wait for approval to complete, useEffect will handle next step
      }
      
      // Step 2: Create comment on-chain (if no approval needed or already approved)
      createComment({
        targetAddress: formData.targetAddress as Address,
        content: formData.content,
        stakeAmount: formData.stakeAmount,
      })
      
      // Note: Don't set isSubmitting to false here - useEffect handles it on success
    } catch (err: any) {
      setError(err?.message || 'Transaction failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-kindred-dark border border-gray-800 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
        <p className="text-gray-400 mb-6">Connect your wallet to start reviewing</p>
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-kindred-dark border border-green-500 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Review Minted On-Chain!</h2>
        <p className="text-gray-400 mb-2">
          Your review has been minted as an NFT on Base Sepolia.
        </p>
        {txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kindred-primary hover:underline text-sm block mb-6"
          >
            View transaction ↗
          </a>
        )}
        <button
          onClick={() => {
            setSubmitted(false)
            setTxHash(null)
            setApprovalDone(false)
            setFormData({
              targetAddress: '',
              rating: 0,
              content: '',
              category: 'k/defi',
              stakeAmount: '0',
              predictedRank: undefined,
            })
          }}
          className="bg-kindred-primary hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
        >
          Write Another Review
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-kindred-dark border border-gray-800 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Target Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Target Address
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={formData.targetAddress}
          onChange={(e) => setFormData({ ...formData, targetAddress: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-kindred-primary focus:outline-none transition"
        />
        <p className="text-xs text-gray-500 mt-1">
          The contract or wallet address you're reviewing
        </p>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Market Category
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`flex flex-col items-start p-4 rounded-lg border transition ${
                formData.category === cat.value
                  ? 'border-kindred-primary bg-kindred-primary/20 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{cat.icon}</span>
                <span className="font-semibold">{cat.label}</span>
              </div>
              <span className="text-xs text-gray-500">{cat.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className={`text-3xl transition-transform hover:scale-110 ${
                star <= formData.rating ? 'text-yellow-400' : 'text-gray-600'
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-gray-400 self-center">
            {formData.rating > 0 ? `${formData.rating}/5` : 'Select rating'}
          </span>
        </div>
      </div>

      {/* Predicted Rank - Opinion Market */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
        <label className="block text-sm font-medium text-purple-300 mb-2">
          🔮 Opinion Market: Predict This Week's Rank
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Where will this project rank in {formData.category} by end of week? Stake to earn if you're right!
        </p>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => setFormData({ ...formData, predictedRank: rank })}
              className={`py-2 rounded-lg border font-bold transition ${
                formData.predictedRank === rank
                  ? 'border-purple-500 bg-purple-500/30 text-white'
                  : 'border-gray-700 text-gray-500 hover:border-purple-500/50'
              }`}
            >
              #{rank}
            </button>
          ))}
        </div>
        {formData.predictedRank && (
          <p className="text-xs text-purple-300 mt-2">
            You predict this will be <strong>#{formData.predictedRank}</strong> in {formData.category} rankings
          </p>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Review Content
        </label>
        <textarea
          placeholder="Share your analysis... Why will this project rank where you predict? (minimum 10 characters)"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={5}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-kindred-primary focus:outline-none transition resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.content.length}/2000 characters
        </p>
      </div>

      {/* Stake Amount */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Stake Amount (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Stake $OPEN to boost your reputation and prove you're serious
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {STAKE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, stakeAmount: option.value })}
              className={`flex flex-col items-center px-4 py-3 rounded-lg border transition ${
                formData.stakeAmount === option.value
                  ? 'border-kindred-primary bg-kindred-primary/20'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="font-semibold">{option.label}</span>
              <span className="text-xs text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || isApproving || isApproving || isCreating || isConfirmingApprove || isConfirmingComment}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
          isSubmitting || isApproving || isCreating || isConfirmingApprove || isConfirmingComment
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-kindred-primary hover:bg-orange-600 text-white'
        }`}
      >
        {isApproving || isConfirmingApprove ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            {isApproving ? 'Approving $OPEN...' : 'Confirming approval...'}
          </span>
        ) : isCreating || isConfirmingComment ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            {isCreating ? 'Minting NFT...' : 'Confirming transaction...'}
          </span>
        ) : needsApproval && !approvalDone ? (
          'Approve $OPEN'
        ) : (
          'Mint Review NFT'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By submitting, you agree that your review will be minted as an NFT on-chain.
      </p>
    </form>
  )
}
