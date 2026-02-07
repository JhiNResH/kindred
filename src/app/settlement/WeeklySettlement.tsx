'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { Trophy, TrendingUp, Clock, Gift } from 'lucide-react'

const PROJECTS = [
  { id: '0x1', name: 'Uniswap', category: 'DeFi', currentRank: 1 },
  { id: '0x2', name: 'Aave', category: 'DeFi', currentRank: 2 },
  { id: '0x3', name: 'Compound', category: 'DeFi', currentRank: 3 },
  { id: '0x4', name: 'Curve', category: 'DeFi', currentRank: 4 },
  { id: '0x5', name: 'MakerDAO', category: 'DeFi', currentRank: 5 },
  { id: '0x6', name: 'Lido', category: 'DeFi', currentRank: 6 },
  { id: '0x7', name: 'Synthetix', category: 'DeFi', currentRank: 7 },
  { id: '0x8', name: 'Balancer', category: 'DeFi', currentRank: 8 },
  { id: '0x9', name: 'Yearn', category: 'DeFi', currentRank: 9 },
  { id: '0xa', name: 'Convex', category: 'DeFi', currentRank: 10 },
]

export function WeeklySettlement() {
  const { isConnected } = useAccount()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [predictedRank, setPredictedRank] = useState<number | null>(null)
  const [stakeAmount, setStakeAmount] = useState('10')

  // Mock data
  const roundEndTime = Date.now() + 5 * 24 * 60 * 60 * 1000 // 5 days from now
  const isEarlyBird = true // Within first 24h
  const totalStaked = '15420'
  const yourPredictions = 3

  const handlePredict = () => {
    if (!selectedProject || !predictedRank) return
    alert(`Prediction submitted! Project: ${selectedProject}, Rank: ${predictedRank}, Stake: ${stakeAmount} KIND`)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Weekly Settlement</h1>
            <p className="text-gray-400 mb-8">
              Predict project rankings and earn rewards
            </p>
            <WalletButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Weekly Settlement - Round #42</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Predict which projects will rank in the top 10 by week's end. Earn rewards if you're right!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
            <Clock className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold mb-1">
              {Math.floor((roundEndTime - Date.now()) / (24 * 60 * 60 * 1000))}d {Math.floor(((roundEndTime - Date.now()) % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))}h
            </div>
            <div className="text-sm text-gray-400">Time Remaining</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold mb-1">{totalStaked} KIND</div>
            <div className="text-sm text-gray-400">Total Staked</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6">
            <Gift className="w-8 h-8 text-orange-400 mb-2" />
            <div className="text-2xl font-bold mb-1">{yourPredictions}</div>
            <div className="text-sm text-gray-400">Your Predictions</div>
          </div>

          {isEarlyBird && (
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-lg font-bold mb-1">Early Bird!</div>
              <div className="text-sm text-gray-400">+10% Bonus</div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Prediction Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Make a Prediction</h2>

            {/* Select Project */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Select Project
              </label>
              <div className="grid gap-2">
                {PROJECTS.slice(0, 5).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`flex items-center justify-between p-4 rounded-lg border transition ${
                      selectedProject === project.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="font-semibold">{project.name}</span>
                    <span className="text-sm text-gray-400">
                      Current: #{project.currentRank}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Predict Rank */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Predict Rank (1-10)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
                  <button
                    key={rank}
                    onClick={() => setPredictedRank(rank)}
                    className={`py-3 rounded-lg border font-bold transition ${
                      predictedRank === rank
                        ? 'border-purple-500 bg-purple-500/30 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-purple-500/50'
                    }`}
                  >
                    #{rank}
                  </button>
                ))}
              </div>
            </div>

            {/* Stake Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Stake Amount
              </label>
              <div className="flex gap-2">
                {['5', '10', '25', '50'].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setStakeAmount(amount)}
                    className={`flex-1 py-2 rounded-lg border transition ${
                      stakeAmount === amount
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {amount} KIND
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handlePredict}
              disabled={!selectedProject || !predictedRank}
              className={`w-full py-4 rounded-lg font-semibold transition ${
                selectedProject && predictedRank
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Prediction
            </button>

            {selectedProject && predictedRank && (
              <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="text-sm text-purple-300">
                  You're predicting <strong>{PROJECTS.find(p => p.id === selectedProject)?.name}</strong> will rank <strong>#{predictedRank}</strong> with <strong>{stakeAmount} KIND</strong> staked.
                </div>
              </div>
            )}
          </div>

          {/* Current Rankings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Current Rankings</h2>
            <div className="space-y-2">
              {PROJECTS.map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-500">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{project.name}</div>
                      <div className="text-sm text-gray-400">{project.category}</div>
                    </div>
                  </div>
                  {index < 3 && (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Predict Rankings</h3>
            <p className="text-gray-400 text-sm">
              Stake KIND tokens to predict where projects will rank by end of week
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
            <p className="text-gray-400 text-sm">
              Correct predictions share 70% of the reward pool (stake-weighted)
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Early Bird Bonus</h3>
            <p className="text-gray-400 text-sm">
              First 24h predictors get extra 10% bonus from reward pool
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
