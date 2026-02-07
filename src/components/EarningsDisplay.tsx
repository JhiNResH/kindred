'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react'

interface EarningsData {
  totalEarned: string
  fromContent: string
  fromVoting: string
  recentDistributions: Array<{
    contentId: string
    amount: string
    source: 'author' | 'early_voter'
    timestamp: string
  }>
}

export function EarningsDisplay() {
  const { address, isConnected } = useAccount()
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return

    const fetchEarnings = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/earnings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        })

        if (response.ok) {
          const data = await response.json()
          setEarnings(data)
        }
      } catch (error) {
        console.error('[Earnings] Failed to fetch:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [address])

  if (!isConnected || !address) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-green-400" />
          <div>
            <div className="text-sm text-gray-400">Total Earned</div>
            <div className="text-2xl font-bold text-green-400">$0.00</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💡 Earn by creating content or being an early supporter!
        </p>
      </div>
    )
  }

  const total = parseFloat(earnings.totalEarned)
  const fromContent = parseFloat(earnings.fromContent)
  const fromVoting = parseFloat(earnings.fromVoting)

  return (
    <div className="space-y-4">
      {/* Total Earnings Card */}
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Earned (USDC)</div>
              <div className="text-3xl font-bold text-green-400">${total.toFixed(2)}</div>
            </div>
          </div>
          <Award className="w-8 h-8 text-green-400/50" />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-green-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <TrendingUp className="w-3 h-3" />
              From Content (70%)
            </div>
            <div className="text-lg font-semibold text-green-300">
              ${fromContent.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Users className="w-3 h-3" />
              From Early Voting (20%)
            </div>
            <div className="text-lg font-semibold text-blue-300">
              ${fromVoting.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Distributions */}
      {earnings.recentDistributions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Earnings</h3>
          <div className="space-y-2">
            {earnings.recentDistributions.slice(0, 5).map((dist, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm p-2 rounded bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  {dist.source === 'author' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <Users className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="text-gray-400">
                    {dist.source === 'author' ? 'Content unlock' : 'Early voting reward'}
                  </span>
                </div>
                <span className="font-semibold text-green-400">+${parseFloat(dist.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-xs text-blue-300">
          💡 <strong>How to earn more:</strong>
        </p>
        <ul className="text-xs text-gray-400 mt-2 space-y-1">
          <li>• Write quality reviews (earn 70% of unlock fees)</li>
          <li>• Upvote early (earn 20% as early supporter)</li>
          <li>• Higher stake = bigger share of rewards</li>
        </ul>
      </div>
    </div>
  )
}
