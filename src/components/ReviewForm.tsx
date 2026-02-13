'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { useIsMounted } from './ClientOnly'
import {
  useKindBalance,
  useKindAllowance,
  useApproveKind,
  formatKind,
  parseKind,
} from '@/hooks/useKindToken'
import {
  useCreateComment,
} from '@/hooks/useMaatComment'

type Category = 'k/memecoin' | 'k/defi' | 'k/perp-dex' | 'k/ai'

interface ReviewFormData {
  targetAddress: string
  rating: number
  content: string
  category: Category
  stakeAmount: string
  predictedRank?: number
}

const CATEGORIES: { value: Category; label: string; icon: string; description: string }[] = [
  { value: 'k/memecoin', label: 'Memecoins', icon: '🐸', description: 'PEPE, DOGE, WIF...' },
  { value: 'k/defi', label: 'DeFi', icon: '🏦', description: 'Aave, Compound, Uniswap...' },
  { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈', description: 'GMX, dYdX, Hyperliquid...' },
  { value: 'k/ai', label: 'AI Agents', icon: '🤖', description: 'AI16Z, Virtual, Griffain...' },
]

const STAKE_OPTIONS = [
  { value: '100', label: '100 KIND', description: 'Minimum stake' },
  { value: '500', label: '500 KIND', description: '+20% reputation' },
  { value: '1000', label: '1000 KIND', description: '+50% reputation' },
  { value: '5000', label: '5000 KIND', description: 'Max reputation' },
]

export function ReviewForm() {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  
  // Token state
  const { data: balance } = useKindBalance(address)
  const { data: allowance } = useKindAllowance(address)
  const { approve, isPending: isApproving } = useApproveKind()
  
  // Comment creation
  const { createComment, isPending: isCreating, isSuccess: isCreated, hash: txHash } = useCreateComment()
  
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ReviewFormData>({
    targetAddress: '',
    rating: 0,
    content: '',
    category: 'k/defi',
    stakeAmount: '100',
    predictedRank: undefined,
  })

  // Check if approval is needed
  const stakeAmountBigInt = parseKind(formData.stakeAmount)
  const needsApproval = !allowance || (allowance as bigint) < stakeAmountBigInt
  const hasBalance = balance && (balance as bigint) >= stakeAmountBigInt

  // Reset form on success
  useEffect(() => {
    if (isCreated) {
      setTimeout(() => {
        setFormData({
          targetAddress: '',
          rating: 0,
          content: '',
          category: 'k/defi',
          stakeAmount: '100',
          predictedRank: undefined,
        })
      }, 3000)
    }
  }, [isCreated])

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

  const handleApprove = () => {
    setError(null)
    try {
      // Approve a large amount to avoid multiple approvals
      approve(parseKind('1000000').toString())
    } catch (err) {
      setError('Approval failed. Please try again.')
      console.error(err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
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
    if (!hasBalance) {
      setError('Insufficient KIND balance')
      return
    }

    try {
      // Create project ID from category + target address
      const projectIdString = `${formData.category}:${formData.targetAddress}`
      const projectIdBytes32 = '0x' + Buffer.from(projectIdString).toString('hex').padEnd(64, '0')
      
      // Create content hash (simplified - in production use IPFS)
      const contentHash = JSON.stringify({
        content: formData.content,
        rating: formData.rating,
        predictedRank: formData.predictedRank,
        timestamp: Date.now(),
      })

      createComment({
        targetAddress: projectIdBytes32 as `0x${string}`,
        content: contentHash,
        stakeAmount: stakeAmountBigInt.toString(),
      })
      
      // Note: Transaction success/failure handled by isCreated state
    } catch (err) {
      setError('Transaction failed. Please try again.')
      console.error(err)
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

  if (isCreated) {
    return (
      <div className="bg-kindred-dark border border-green-500 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Review Minted On-Chain!</h2>
        <p className="text-gray-400 mb-4">
          Your review has been minted as an NFT.
        </p>
        {txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kindred-primary hover:underline text-sm"
          >
            View Transaction →
          </a>
        )}
        <div className="mt-6 text-sm text-gray-500">
          The form will reset in a moment...
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-kindred-dark border border-gray-800 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-2">Write a Review</h2>
      <p className="text-sm text-gray-400 mb-6">
        Balance: {balance ? formatKind(balance as bigint) : '0'} KIND
      </p>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Approval Step */}
      {needsApproval && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Step 1: Approve Tokens</h3>
          <p className="text-sm text-gray-400 mb-3">
            Allow the contract to stake your KIND tokens
          </p>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isApproving || !hasBalance}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isApproving ? 'Approving...' : 'Approve KIND Tokens'}
          </button>
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

      {/* Predicted Rank */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
        <label className="block text-sm font-medium text-purple-300 mb-2">
          🔮 Opinion Market: Predict This Week's Rank
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Where will this project rank in {formData.category} by end of week?
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
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Review Content
        </label>
        <textarea
          placeholder="Share your analysis... (minimum 10 characters)"
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
          Stake Amount
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Stake KIND tokens to prove you're serious
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
        disabled={isCreating || needsApproval || !hasBalance}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
          isCreating || needsApproval || !hasBalance
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-kindred-primary hover:bg-orange-600 text-white'
        }`}
      >
        {isCreating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Minting Review NFT...
          </span>
        ) : needsApproval ? (
          'Approve Tokens First'
        ) : !hasBalance ? (
          'Insufficient Balance'
        ) : (
          'Submit Review (On-Chain)'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By submitting, your review will be minted as an NFT on-chain.
      </p>
    </form>
  )
}
