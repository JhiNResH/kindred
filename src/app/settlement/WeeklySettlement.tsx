'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { Trophy, TrendingUp, Clock, Gift, Loader2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  category: string
  currentRank: number
}

export function WeeklySettlement() {
  const { isConnected } = useAccount()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [predictedRank, setPredictedRank] = useState<number | null>(null)
  const [stakeAmount, setStakeAmount] = useState('10')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [roundData, setRoundData] = useState({
    roundEndTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
    isEarlyBird: true,
    totalStaked: '15420',
    yourPredictions: 3,
  })

  // 從 API 抓取排行榜
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard?category=k/defi&limit=10')
        const data = await res.json()
        const projectsData = data.leaderboard.map((p: any, idx: number) => ({
          id: p.projectAddress,
          name: p.projectName,
          category: p.category,
          currentRank: p.rank,
        }))
        setProjects(projectsData)
      } catch (error) {
        console.error('無法抓取排行榜:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const roundEndTime = roundData.roundEndTime
  const isEarlyBird = roundData.isEarlyBird
  const totalStaked = roundData.totalStaked
  const yourPredictions = roundData.yourPredictions

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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              ) : projects.length > 0 ? (
                <div className="grid gap-2">
                  {projects.slice(0, 5).map((project) => (
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
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No projects available
                </div>
              )}
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
                  You're predicting <strong>{projects.find(p => p.id === selectedProject)?.name}</strong> will rank <strong>#{predictedRank}</strong> with <strong>{stakeAmount} KIND</strong> staked.
                </div>
              </div>
            )}
          </div>

          {/* Current Rankings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Current Rankings</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project, index) => (
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
            ) : (
              <div className="p-4 text-center text-gray-400">
                No rankings available
              </div>
            )}
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
