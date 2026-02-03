'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Coins, TrendingUp, Clock } from 'lucide-react'

interface StakeVoteButtonsProps {
  initialScore: number
  totalStaked: string
  userVote?: 'up' | 'down' | null
  userStake?: string
  earlyVoterBonus?: number // Percentage bonus for early voters
  onVote?: (vote: 'up' | 'down', stakeAmount: string) => void
  size?: 'sm' | 'md' | 'lg'
  horizontal?: boolean
}

const STAKE_OPTIONS = [
  { value: '0', label: 'Free Vote', weight: 1 },
  { value: '1', label: '1 $KIND', weight: 2 },
  { value: '5', label: '5 $KIND', weight: 5 },
  { value: '10', label: '10 $KIND', weight: 10 },
  { value: '50', label: '50 $KIND', weight: 25 },
]

export function StakeVoteButtons({ 
  initialScore, 
  totalStaked,
  userVote: initialUserVote = null,
  userStake: initialUserStake = '0',
  earlyVoterBonus = 0,
  onVote,
  size = 'md',
  horizontal = false
}: StakeVoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote)
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [pendingVote, setPendingVote] = useState<'up' | 'down' | null>(null)
  const [selectedStake, setSelectedStake] = useState('0')

  const handleVoteClick = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      // Remove vote (no stake refund in this simple version)
      setScore(initialScore)
      setUserVote(null)
      return
    }
    
    // Show stake modal for new vote
    setPendingVote(vote)
    setShowStakeModal(true)
  }

  const confirmVote = () => {
    if (!pendingVote) return
    
    const stakeOption = STAKE_OPTIONS.find(o => o.value === selectedStake)
    const weight = stakeOption?.weight || 1
    
    let newScore = initialScore
    if (userVote === null) {
      newScore = initialScore + (pendingVote === 'up' ? weight : -weight)
    } else {
      newScore = initialScore + (pendingVote === 'up' ? weight * 2 : -weight * 2)
    }

    setScore(newScore)
    setUserVote(pendingVote)
    setShowStakeModal(false)
    onVote?.(pendingVote, selectedStake)
  }

  const sizeClasses = {
    sm: { container: 'gap-0.5', button: 'p-0.5', icon: 'w-4 h-4', text: 'text-xs' },
    md: { container: 'gap-1', button: 'p-1', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { container: 'gap-1.5', button: 'p-1.5', icon: 'w-6 h-6', text: 'text-base' },
  }

  const s = sizeClasses[size]

  return (
    <>
      <div className={`flex ${horizontal ? 'flex-row' : 'flex-col'} items-center ${s.container}`}>
        {/* Upvote Button */}
        <button
          onClick={() => handleVoteClick('up')}
          className={`${s.button} rounded hover:bg-green-500/20 transition-colors group ${
            userVote === 'up' ? 'text-green-500' : 'text-[#6b6b70] hover:text-green-500'
          }`}
          aria-label="Upvote (Stake)"
        >
          <div className="relative">
            <ChevronUp className={s.icon} strokeWidth={userVote === 'up' ? 3 : 2} />
            {userVote !== 'up' && (
              <Coins className="w-2 h-2 absolute -right-1 -bottom-1 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </button>
        
        {/* Score */}
        <div className="text-center">
          <span className={`${s.text} font-bold block ${
            userVote === 'up' ? 'text-green-500' : 
            userVote === 'down' ? 'text-red-500' : 
            'text-[#adadb0]'
          }`}>
            {formatScore(score)}
          </span>
          {parseFloat(totalStaked) > 0 && (
            <span className="text-[10px] text-yellow-500/70 flex items-center justify-center gap-0.5">
              <Coins className="w-2.5 h-2.5" />
              {totalStaked}
            </span>
          )}
        </div>
        
        {/* Downvote Button */}
        <button
          onClick={() => handleVoteClick('down')}
          className={`${s.button} rounded hover:bg-red-500/20 transition-colors ${
            userVote === 'down' ? 'text-red-500' : 'text-[#6b6b70] hover:text-red-500'
          }`}
          aria-label="Downvote (Stake)"
        >
          <ChevronDown className={s.icon} strokeWidth={userVote === 'down' ? 3 : 2} />
        </button>

        {/* Early Voter Badge */}
        {earlyVoterBonus > 0 && userVote && (
          <div className="mt-1 px-1.5 py-0.5 bg-purple-500/20 rounded text-[9px] text-purple-400 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            +{earlyVoterBonus}%
          </div>
        )}
      </div>

      {/* Stake Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              {pendingVote === 'up' ? (
                <><TrendingUp className="w-5 h-5 text-green-500" /> Upvote</>
              ) : (
                <><TrendingUp className="w-5 h-5 text-red-500 rotate-180" /> Downvote</>
              )}
            </h3>
            
            <p className="text-sm text-[#6b6b70] mb-4">
              Stake $KIND to increase your voting power. Early voters earn revenue share!
            </p>

            {/* Stake Options */}
            <div className="space-y-2 mb-4">
              {STAKE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStake(option.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selectedStake === option.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Coins className={`w-4 h-4 ${option.value === '0' ? 'text-gray-500' : 'text-yellow-500'}`} />
                    <span className="text-white">{option.label}</span>
                  </div>
                  <span className="text-sm text-[#6b6b70]">
                    {option.weight}x weight
                  </span>
                </button>
              ))}
            </div>

            {/* Info */}
            <div className="bg-[#1a1a1d] rounded-lg p-3 mb-4 text-xs text-[#6b6b70]">
              <p className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                Higher stake = More voting power
              </p>
              <p className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-500" />
                Early votes earn revenue share when review gets traction
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowStakeModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#2a2a2e] text-[#adadb0] hover:bg-[#1a1a1d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors ${
                  pendingVote === 'up'
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                Confirm {pendingVote === 'up' ? 'Upvote' : 'Downvote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function formatScore(score: number): string {
  if (score >= 10000) {
    return `${(score / 1000).toFixed(0)}k`
  }
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`
  }
  return score.toString()
}
