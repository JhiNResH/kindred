'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Coins, Lock, Sparkles, AlertCircle } from 'lucide-react'
import { useIsMounted } from './ClientOnly'
import { WalletButton } from './WalletButton'

interface StakedReviewFormProps {
  category: string
  projectAddress?: string
  projectName?: string
  onSubmit?: (review: ReviewData) => void
}

interface ReviewData {
  content: string
  rating: number
  stakeAmount: string
  category: string
  projectAddress?: string
}

const STAKE_TIERS = [
  { amount: '0.1', label: 'Basic', multiplier: 1, color: 'gray' },
  { amount: '1', label: 'Standard', multiplier: 2, color: 'blue' },
  { amount: '5', label: 'Premium', multiplier: 5, color: 'purple' },
  { amount: '10', label: 'Diamond', multiplier: 10, color: 'yellow' },
]

export function StakedReviewForm({ category, projectAddress, projectName, onSubmit }: StakedReviewFormProps) {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [selectedTier, setSelectedTier] = useState(1) // Default to Standard
  const [customStake, setCustomStake] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stakeAmount = customStake || STAKE_TIERS[selectedTier].amount
  const currentTier = STAKE_TIERS[selectedTier]

  if (!isMounted) {
    return (
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-[#1f1f23] rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-[#1f1f23] rounded mb-4"></div>
        <div className="h-12 bg-[#1f1f23] rounded"></div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-8 text-center">
        <Lock className="w-12 h-12 text-[#6b6b70] mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect to Write</h3>
        <p className="text-[#6b6b70] mb-6">
          Stake tokens to publish reviews. Your stake = your credibility.
        </p>
        <WalletButton variant="large" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim() || content.length < 50) {
      setError('Review must be at least 50 characters')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (balance && parseEther(stakeAmount) > balance.value) {
      setError('Insufficient balance for stake')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Call smart contract to stake and create review
      await onSubmit?.({
        content,
        rating,
        stakeAmount: parseEther(stakeAmount).toString(),
        category,
        projectAddress,
      })

      // Reset form
      setContent('')
      setRating(0)
      setSelectedTier(1)
    } catch (err) {
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-[#1f1f23]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">Write Staked Review</h3>
            <p className="text-xs text-[#6b6b70]">
              {projectName ? `Reviewing ${projectName}` : `Posting in ${category}`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-[#adadb0] mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-all hover:scale-110 ${
                  star <= rating ? 'text-yellow-400' : 'text-[#2a2a2e] hover:text-yellow-400/50'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-[#6b6b70] self-center text-sm">
              {rating > 0 ? `${rating}/5` : 'Select'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-[#adadb0] mb-2">Your Review</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your analysis... What makes this project stand out? Any concerns? (min 50 chars)"
            rows={5}
            className="w-full bg-[#0a0a0b] border border-[#1f1f23] rounded-lg px-4 py-3 text-white placeholder:text-[#6b6b70] focus:border-purple-500 focus:outline-none resize-none transition-colors"
          />
          <div className="flex justify-between mt-1 text-xs text-[#6b6b70]">
            <span>{content.length} characters</span>
            <span>{content.length < 50 ? `${50 - content.length} more needed` : '✓ Ready'}</span>
          </div>
        </div>

        {/* Stake Tier Selection */}
        <div>
          <label className="block text-sm font-medium text-[#adadb0] mb-2">
            <Coins className="w-4 h-4 inline mr-1" />
            Stake Amount
          </label>
          <p className="text-xs text-[#6b6b70] mb-3">
            Higher stakes = more visibility + credibility. Your stake is returned if review is not flagged.
          </p>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {STAKE_TIERS.map((tier, index) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => {
                  setSelectedTier(index)
                  setCustomStake('')
                }}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedTier === index && !customStake
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-[#1f1f23] hover:border-[#2a2a2e]'
                }`}
              >
                <div className="font-bold text-lg">{tier.amount}</div>
                <div className="text-xs text-[#6b6b70]">{tier.label}</div>
                <div className="text-xs text-purple-400 mt-1">{tier.multiplier}x boost</div>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6b6b70]">or custom:</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="0.0"
              value={customStake}
              onChange={(e) => setCustomStake(e.target.value)}
              className="w-24 bg-[#0a0a0b] border border-[#1f1f23] rounded px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none"
            />
            <span className="text-sm text-[#6b6b70]">ETH</span>
          </div>

          {balance && (
            <p className="text-xs text-[#6b6b70] mt-2">
              Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="p-4 bg-[#0a0a0b] rounded-lg border border-[#1f1f23]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#6b6b70]">Stake Amount</span>
            <span className="font-mono">{stakeAmount} ETH</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#6b6b70]">Visibility Boost</span>
            <span className="text-purple-400">{currentTier.multiplier}x</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6b6b70]">Review becomes NFT</span>
            <span className="text-green-400">✓ ERC-404</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || content.length < 50 || rating === 0}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
            isSubmitting || content.length < 50 || rating === 0
              ? 'bg-[#1f1f23] text-[#6b6b70] cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Staking & Publishing...
            </span>
          ) : (
            `Stake ${stakeAmount} ETH & Publish`
          )}
        </button>

        <p className="text-xs text-[#6b6b70] text-center">
          By publishing, your review becomes an ERC-404 asset. 
          Stake is refunded after 30 days if not flagged.
        </p>
      </div>
    </form>
  )
}
