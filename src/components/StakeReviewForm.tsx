'use client'

import { useState } from 'react'
import { Coins, Lock, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

interface StakeReviewFormProps {
  projectName?: string
  projectAddress?: string
  category?: string
  onSubmit?: (data: ReviewFormData) => void
  minStake?: string
}

interface ReviewFormData {
  projectName: string
  projectAddress: string
  category: string
  rating: number
  content: string
  stakeAmount: string
  isPremium: boolean // Premium content that requires payment to view
}

const CATEGORIES = [
  { value: 'k/defi', label: 'DeFi', icon: '🏦' },
  { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈' },
  { value: 'k/memecoin', label: 'Memecoin', icon: '🐕' },
  { value: 'k/ai', label: 'AI', icon: '🤖' },
]

const STAKE_TIERS = [
  { value: '1', label: 'Basic', benefit: 'Standard visibility', multiplier: '1x' },
  { value: '5', label: 'Boosted', benefit: '+50% visibility', multiplier: '1.5x' },
  { value: '10', label: 'Featured', benefit: 'Featured placement', multiplier: '2x' },
  { value: '25', label: 'Premium', benefit: 'Top of feed + badge', multiplier: '3x' },
]

export function StakeReviewForm({
  projectName: initialProject = '',
  projectAddress: initialAddress = '',
  category: initialCategory = 'k/defi',
  onSubmit,
  minStake = '1',
}: StakeReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    projectName: initialProject,
    projectAddress: initialAddress,
    category: initialCategory,
    rating: 0,
    content: '',
    stakeAmount: minStake,
    isPremium: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.projectName.trim()) {
      setError('Project name is required')
      return
    }
    if (formData.rating === 0) {
      setError('Please select a rating')
      return
    }
    if (formData.content.length < 50) {
      setError('Review must be at least 50 characters (currently ' + formData.content.length + ')')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Call contract to stake and submit review
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate
      
      onSubmit?.(formData)
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#111113] border border-green-500/30 rounded-xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Review Submitted!</h2>
        <p className="text-[#6b6b70] mb-4">
          Your review has been minted as an ERC-404 token.
        </p>
        <div className="bg-[#1a1a1d] rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-[#adadb0] mb-2">
            <span className="text-purple-400">Staked:</span> {formData.stakeAmount} $KIND
          </p>
          <p className="text-sm text-[#adadb0]">
            <span className="text-purple-400">NFT ID:</span> #12345
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false)
            setFormData({
              ...formData,
              rating: 0,
              content: '',
            })
          }}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          Write Another Review
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        Write a Review
      </h2>
      <p className="text-sm text-[#6b6b70] mb-6">
        Stake $KIND to publish. Your review becomes an NFT you own.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Project Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#adadb0] mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={formData.projectName}
          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
          placeholder="e.g., Aave, Hyperliquid, PEPE"
          className="w-full bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg px-4 py-3 text-white placeholder-[#6b6b70] focus:border-purple-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#adadb0] mb-2">
          Category
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                formData.category === cat.value
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-[#2a2a2e] text-[#6b6b70] hover:border-[#3a3a3e]'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#adadb0] mb-2">
          Rating
        </label>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className={`text-3xl transition-all hover:scale-110 ${
                star <= formData.rating ? 'text-yellow-400' : 'text-[#2a2a2e]'
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-[#6b6b70]">
            {formData.rating > 0 ? `${formData.rating}/5` : 'Select'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#adadb0] mb-2">
          Your Review
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Share your honest experience with this project... (minimum 50 characters)"
          rows={5}
          className="w-full bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg px-4 py-3 text-white placeholder-[#6b6b70] focus:border-purple-500 focus:outline-none transition-colors resize-none"
        />
        <p className="text-xs text-[#6b6b70] mt-1 text-right">
          {formData.content.length}/2000
        </p>
      </div>

      {/* Stake Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#adadb0] mb-2 flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-500" />
          Stake Amount
        </label>
        <p className="text-xs text-[#6b6b70] mb-3">
          Higher stake = More visibility + Higher rewards potential
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {STAKE_TIERS.map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => setFormData({ ...formData, stakeAmount: tier.value })}
              className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                formData.stakeAmount === tier.value
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
              }`}
            >
              <span className="font-semibold text-white">{tier.value} $KIND</span>
              <span className="text-xs text-[#6b6b70]">{tier.label}</span>
              <span className="text-xs text-yellow-500">{tier.multiplier}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Premium Content Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.isPremium ? 'bg-purple-600' : 'bg-[#2a2a2e]'
          }`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              formData.isPremium ? 'translate-x-7' : 'translate-x-1'
            }`} />
            <input
              type="checkbox"
              checked={formData.isPremium}
              onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              className="sr-only"
            />
          </div>
          <div>
            <span className="text-[#adadb0] flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Premium Content (x402)
            </span>
            <span className="text-xs text-[#6b6b70]">
              Readers pay to unlock full review. You earn 70% of revenue.
            </span>
          </div>
        </label>
      </div>

      {/* Summary */}
      <div className="bg-[#1a1a1d] rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-[#adadb0] mb-2">Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6b6b70]">Stake</span>
            <span className="text-yellow-500">{formData.stakeAmount} $KIND</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b6b70]">Visibility Boost</span>
            <span className="text-purple-400">
              {STAKE_TIERS.find(t => t.value === formData.stakeAmount)?.multiplier}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b6b70]">Content Type</span>
            <span className="text-[#adadb0]">{formData.isPremium ? 'Premium (Paid)' : 'Free'}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
          isSubmitting
            ? 'bg-[#2a2a2e] text-[#6b6b70] cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white'
        }`}
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin">⏳</span>
            Staking & Minting...
          </>
        ) : (
          <>
            <Coins className="w-5 h-5" />
            Stake {formData.stakeAmount} $KIND & Publish
          </>
        )}
      </button>

      <p className="text-xs text-[#6b6b70] text-center mt-3">
        Your review will be minted as an ERC-404 NFT that you own and can trade.
      </p>
    </form>
  )
}
