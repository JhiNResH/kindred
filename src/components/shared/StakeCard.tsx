'use client'

import { useState, useMemo } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { parseEther, formatEther } from 'viem'
import { useIsMounted } from '@/components/layout/ClientOnly'

interface Project {
  name: string
  address: string
  category: string
  currentRank: number
  icon: string
}

interface StakeCardProps {
  project: Project
  totalPoolSize: string // in wei
  onStake?: (amount: string, predictedRank: number) => void
}

const RANK_MULTIPLIERS: Record<number, number> = {
  1: 3.0,  // Predict #1 = 3x if correct
  2: 2.5,
  3: 2.0,
  4: 1.8,
  5: 1.6,
  6: 1.5,
  7: 1.4,
  8: 1.3,
  9: 1.2,
  10: 1.1,
}

export function StakeCard({ project, totalPoolSize, onStake }: StakeCardProps) {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  
  const [stakeAmount, setStakeAmount] = useState('')
  const [predictedRank, setPredictedRank] = useState<number | null>(null)

  // Prevent SSR hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    )
  }
  const [isStaking, setIsStaking] = useState(false)

  const potentialReturn = useMemo(() => {
    if (!stakeAmount || !predictedRank) return null
    const amount = parseFloat(stakeAmount)
    if (isNaN(amount) || amount <= 0) return null
    
    const multiplier = RANK_MULTIPLIERS[predictedRank] || 1
    return {
      ifCorrect: amount * multiplier,
      ifClose: amount * (multiplier * 0.5), // Half reward if within 2 ranks
      multiplier,
    }
  }, [stakeAmount, predictedRank])

  const poolSizeFormatted = formatEther(BigInt(totalPoolSize))

  const handleStake = async () => {
    if (!stakeAmount || !predictedRank || !onStake) return
    
    setIsStaking(true)
    try {
      await onStake(parseEther(stakeAmount).toString(), predictedRank)
    } finally {
      setIsStaking(false)
    }
  }

  const setPercentage = (percent: number) => {
    if (!balance) return
    const amount = (parseFloat(formatEther(balance.value)) * percent / 100).toFixed(4)
    setStakeAmount(amount)
  }

  if (!isConnected) {
    return (
      <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">💰</div>
        <h3 className="text-xl font-bold mb-2">Stake Your Prediction</h3>
        <p className="text-gray-400 mb-4">Connect wallet to stake on rankings</p>
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{project.icon}</span>
            <div>
              <h3 className="font-bold">{project.name}</h3>
              <p className="text-xs text-gray-400">Current: #{project.currentRank}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Pool Size</div>
            <div className="text-green-400 font-mono font-bold">
              {parseFloat(poolSizeFormatted).toLocaleString()} OPEN
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Predict Rank */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            🔮 Predict Final Rank
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
              <button
                key={rank}
                onClick={() => setPredictedRank(rank)}
                className={`py-3 rounded-lg border font-bold transition relative ${
                  predictedRank === rank
                    ? 'border-green-500 bg-green-500/30 text-white'
                    : 'border-gray-700 text-gray-500 hover:border-green-500/50'
                }`}
              >
                #{rank}
                {predictedRank === rank && (
                  <span className="absolute -top-2 -right-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                    {RANK_MULTIPLIERS[rank]}x
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Higher risk (predicting #1) = Higher reward (3x multiplier)
          </p>
        </div>

        {/* Stake Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            💰 Stake Amount
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-mono placeholder-gray-600 focus:border-green-500 focus:outline-none transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              OPEN
            </span>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-2">
            {[10, 25, 50, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => setPercentage(percent)}
                className="flex-1 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded transition"
              >
                {percent}%
              </button>
            ))}
          </div>
          
          {balance && (
            <p className="text-xs text-gray-500 mt-2">
              Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
            </p>
          )}
        </div>

        {/* Potential Returns */}
        {potentialReturn && (
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-400">Potential Returns</h4>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">If exact rank:</span>
              <span className="text-green-400 font-bold font-mono">
                +{potentialReturn.ifCorrect.toFixed(2)} OPEN ({potentialReturn.multiplier}x)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">If within 2 ranks:</span>
              <span className="text-yellow-400 font-mono">
                +{potentialReturn.ifClose.toFixed(2)} OPEN
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">If wrong:</span>
              <span className="text-red-400 font-mono">
                -{stakeAmount} OPEN
              </span>
            </div>
          </div>
        )}

        {/* Stake Button */}
        <button
          onClick={handleStake}
          disabled={!stakeAmount || !predictedRank || isStaking}
          className={`w-full py-4 rounded-lg font-bold text-lg transition ${
            !stakeAmount || !predictedRank || isStaking
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
          }`}
        >
          {isStaking ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Staking...
            </span>
          ) : !predictedRank ? (
            'Select a rank prediction'
          ) : !stakeAmount ? (
            'Enter stake amount'
          ) : (
            `Stake ${stakeAmount} OPEN on #${predictedRank}`
          )}
        </button>

        {/* Settlement Info */}
        <p className="text-xs text-gray-500 text-center">
          Rankings settle every Sunday 00:00 UTC. 
          Staked tokens are locked until settlement.
        </p>
      </div>
    </div>
  )
}
