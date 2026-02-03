'use client'

import { useState } from 'react'
import { Lock, Unlock, Coins, Eye, TrendingUp, User } from 'lucide-react'
import { StakeVoteButtons } from './StakeVoteButtons'

interface PurchaseReviewCardProps {
  id: string
  project: string
  projectIcon?: string
  category: string
  rating: number
  author: string
  authorReputation: number
  previewContent: string // First part of content (free)
  fullContent?: string // Full content (paid/unlocked)
  isUnlocked?: boolean
  unlockPrice: string // in $KIND
  totalUnlocks: number
  upvotes: number
  totalStaked: string
  timestamp: string
  earlyVoterBonus?: number
  onUnlock?: () => void
}

export function PurchaseReviewCard({
  id,
  project,
  projectIcon = '🔷',
  category,
  rating,
  author,
  authorReputation,
  previewContent,
  fullContent,
  isUnlocked: initialUnlocked = false,
  unlockPrice,
  totalUnlocks,
  upvotes,
  totalStaked,
  timestamp,
  earlyVoterBonus = 0,
  onUnlock,
}: PurchaseReviewCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(initialUnlocked)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handleUnlock = async () => {
    setIsPurchasing(true)
    try {
      // TODO: Call x402 payment
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsUnlocked(true)
      onUnlock?.()
    } catch (err) {
      console.error('Failed to unlock')
    } finally {
      setIsPurchasing(false)
    }
  }

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getRatingColor = (r: number) => {
    if (r >= 4.5) return 'text-green-400 bg-green-500/10'
    if (r >= 3.5) return 'text-yellow-400 bg-yellow-500/10'
    return 'text-orange-400 bg-orange-500/10'
  }

  const getReputationLevel = (rep: number) => {
    if (rep >= 1000) return { label: 'Expert', color: 'text-purple-400' }
    if (rep >= 500) return { label: 'Trusted', color: 'text-blue-400' }
    if (rep >= 100) return { label: 'Active', color: 'text-green-400' }
    return { label: 'New', color: 'text-gray-400' }
  }

  const repLevel = getReputationLevel(authorReputation)

  return (
    <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl overflow-hidden hover:border-[#3a3a3e] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1f1f23]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{projectIcon}</span>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {project}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRatingColor(rating)}`}>
                ★ {rating.toFixed(1)}
              </span>
            </h3>
            <a href={`/k/${category}`} className="text-xs text-[#6b6b70] hover:text-purple-400">
              {category}
            </a>
          </div>
        </div>
        
        {/* Premium Badge */}
        <div className="flex items-center gap-2">
          {!isUnlocked ? (
            <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Premium
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-medium text-green-400 flex items-center gap-1">
              <Unlock className="w-3 h-3" />
              Unlocked
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center gap-2 text-xs text-[#6b6b70] mb-3">
          <User className="w-3.5 h-3.5" />
          <a href={`/u/${author}`} className="hover:text-white">
            {author.slice(0, 6)}...{author.slice(-4)}
          </a>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${repLevel.color} bg-current/10`}>
            {repLevel.label}
          </span>
          <span>•</span>
          <span>{formatTimestamp(timestamp)}</span>
        </div>

        {/* Preview Content */}
        <p className="text-[#adadb0] mb-4">
          {previewContent}
        </p>

        {/* Locked Content */}
        {!isUnlocked ? (
          <div className="relative">
            {/* Blurred Preview */}
            <div className="bg-[#1a1a1d] rounded-lg p-4 relative overflow-hidden">
              <p className="text-[#6b6b70] blur-sm select-none">
                {fullContent || "This premium content contains detailed analysis, insider insights, and actionable recommendations that the author has spent significant time researching..."}
              </p>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1d] to-transparent flex flex-col items-center justify-center">
                <Lock className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-sm text-[#adadb0] mb-3">Premium content</p>
                
                <button
                  onClick={handleUnlock}
                  disabled={isPurchasing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isPurchasing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      Unlock for {unlockPrice} $KIND
                    </>
                  )}
                </button>
                
                <p className="text-xs text-[#6b6b70] mt-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {totalUnlocks} unlocks
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1d] rounded-lg p-4 border border-green-500/20">
            <p className="text-[#adadb0]">
              {fullContent || "Full premium content revealed! This includes detailed protocol analysis, risk assessment, and investment thesis..."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f1f23] bg-[#0a0a0b]">
        <StakeVoteButtons
          initialScore={upvotes}
          totalStaked={totalStaked}
          earlyVoterBonus={earlyVoterBonus}
          horizontal
          size="sm"
        />
        
        <div className="flex items-center gap-3 text-xs text-[#6b6b70]">
          <span className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            {totalStaked} staked
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            {totalUnlocks} unlocks
          </span>
        </div>
      </div>
    </div>
  )
}
