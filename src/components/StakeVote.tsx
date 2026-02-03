'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Coins, TrendingUp, Users } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useIsMounted } from './ClientOnly'

interface StakeVoteProps {
  reviewId: string
  initialUpvotes: number
  initialDownvotes: number
  totalStaked: string // in ETH
  userStake?: { amount: string; direction: 'up' | 'down' } | null
  earlyBird?: boolean // Is user among first voters?
  onVote?: (direction: 'up' | 'down', amount: string) => void
}

const STAKE_AMOUNTS = ['0.01', '0.05', '0.1', '0.5']

export function StakeVote({
  reviewId,
  initialUpvotes,
  initialDownvotes,
  totalStaked,
  userStake,
  earlyBird,
  onVote
}: StakeVoteProps) {
  const isMounted = useIsMounted()
  const { isConnected } = useAccount()
  
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [voteDirection, setVoteDirection] = useState<'up' | 'down' | null>(null)
  const [stakeAmount, setStakeAmount] = useState('0.05')
  const [isVoting, setIsVoting] = useState(false)

  const netScore = initialUpvotes - initialDownvotes

  const handleVoteClick = (direction: 'up' | 'down') => {
    if (!isConnected) {
      // TODO: Prompt wallet connection
      return
    }
    setVoteDirection(direction)
    setShowStakeModal(true)
  }

  const handleConfirmVote = async () => {
    if (!voteDirection || !stakeAmount) return
    
    setIsVoting(true)
    try {
      await onVote?.(voteDirection, stakeAmount)
      setShowStakeModal(false)
    } finally {
      setIsVoting(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center gap-1 p-2 bg-[#0a0a0b] rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-[#1f1f23] rounded"></div>
        <div className="w-6 h-4 bg-[#1f1f23] rounded"></div>
        <div className="w-8 h-8 bg-[#1f1f23] rounded"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1 p-2 bg-[#0a0a0b] rounded-lg border border-[#1f1f23]">
        {/* Upvote Button */}
        <button
          onClick={() => handleVoteClick('up')}
          className={`p-2 rounded-lg transition-all hover:scale-110 ${
            userStake?.direction === 'up'
              ? 'bg-green-500/20 text-green-400'
              : 'text-[#6b6b70] hover:text-green-400 hover:bg-green-500/10'
          }`}
          title="Stake on this review"
        >
          <ChevronUp className="w-6 h-6" strokeWidth={userStake?.direction === 'up' ? 3 : 2} />
        </button>

        {/* Score */}
        <div className="text-center">
          <div className={`font-bold text-lg ${
            netScore > 0 ? 'text-green-400' : netScore < 0 ? 'text-red-400' : 'text-[#adadb0]'
          }`}>
            {netScore > 0 ? '+' : ''}{netScore}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#6b6b70]">
            <Coins className="w-3 h-3" />
            {totalStaked}
          </div>
        </div>

        {/* Downvote Button */}
        <button
          onClick={() => handleVoteClick('down')}
          className={`p-2 rounded-lg transition-all hover:scale-110 ${
            userStake?.direction === 'down'
              ? 'bg-red-500/20 text-red-400'
              : 'text-[#6b6b70] hover:text-red-400 hover:bg-red-500/10'
          }`}
          title="Stake against this review"
        >
          <ChevronDown className="w-6 h-6" strokeWidth={userStake?.direction === 'down' ? 3 : 2} />
        </button>

        {/* Early Bird Badge */}
        {earlyBird && (
          <div className="mt-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] rounded-full font-medium">
            🐤 Early
          </div>
        )}
      </div>

      {/* Stake Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111113] border border-[#1f1f23] rounded-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className={`p-4 border-b border-[#1f1f23] ${
              voteDirection === 'up' 
                ? 'bg-gradient-to-r from-green-500/10 to-green-600/5' 
                : 'bg-gradient-to-r from-red-500/10 to-red-600/5'
            }`}>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {voteDirection === 'up' ? (
                  <>
                    <ChevronUp className="w-5 h-5 text-green-400" />
                    Stake FOR this review
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 text-red-400" />
                    Stake AGAINST this review
                  </>
                )}
              </h3>
              <p className="text-sm text-[#6b6b70] mt-1">
                Your stake = your conviction. Earn rewards if you're right!
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Stake Amount */}
              <div>
                <label className="block text-sm font-medium text-[#adadb0] mb-2">
                  Stake Amount (ETH)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {STAKE_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setStakeAmount(amount)}
                      className={`py-2 rounded-lg border font-mono text-sm transition-all ${
                        stakeAmount === amount
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-[#1f1f23] text-[#6b6b70] hover:border-[#2a2a2e]'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0a0a0b] rounded-lg border border-[#1f1f23]">
                  <div className="flex items-center gap-2 text-xs text-[#6b6b70] mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Potential Return
                  </div>
                  <div className="font-bold text-green-400">
                    +{(parseFloat(stakeAmount) * 2).toFixed(2)} ETH
                  </div>
                </div>
                <div className="p-3 bg-[#0a0a0b] rounded-lg border border-[#1f1f23]">
                  <div className="flex items-center gap-2 text-xs text-[#6b6b70] mb-1">
                    <Users className="w-3 h-3" />
                    Current Stakers
                  </div>
                  <div className="font-bold">{initialUpvotes + initialDownvotes}</div>
                </div>
              </div>

              {/* Early Bird Notice */}
              {initialUpvotes + initialDownvotes < 10 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
                  <span className="text-yellow-400 font-medium">🐤 Early Bird Bonus!</span>
                  <span className="text-[#adadb0] ml-1">
                    Be among the first 10 stakers to earn extra rewards
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1f1f23] flex gap-3">
              <button
                onClick={() => setShowStakeModal(false)}
                className="flex-1 py-3 rounded-lg border border-[#2a2a2e] text-[#adadb0] font-medium hover:bg-[#1a1a1d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVote}
                disabled={isVoting}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  voteDirection === 'up'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/30'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30'
                }`}
              >
                {isVoting ? 'Staking...' : `Stake ${stakeAmount} ETH`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
