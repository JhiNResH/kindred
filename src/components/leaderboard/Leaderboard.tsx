'use client'

import { useState, useEffect } from 'react'

type Category = 'k/wallet' | 'k/defi' | 'k/perp-dex' | 'k/ai'

interface LeaderboardEntry {
  rank: number
  previousRank: number | null
  projectName: string
  projectAddress: string
  category: Category
  score: number
  totalStaked: string
  reviewCount: number
  weeklyChange: number
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'k/wallet', label: 'Wallets', icon: '💳' },
  { value: 'k/defi', label: 'DeFi', icon: '🏦' },
  { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈' },
  { value: 'k/ai', label: 'AI Agents', icon: '🤖' },
]

export function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('k/defi')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaderboard?category=${selectedCategory}`)
        const data = await res.json()
        setEntries(data.entries || [])
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [selectedCategory])

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  
  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <span className="text-green-400">▲{change}</span>
    if (change < 0) return <span className="text-red-400">▼{Math.abs(change)}</span>
    return <span className="text-gray-500">―</span>
  }

  const getWeekEndDate = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilSunday = 7 - dayOfWeek
    const sunday = new Date(now)
    sunday.setDate(now.getDate() + daysUntilSunday)
    return sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🏆 Weekly Rankings</h2>
            <p className="text-gray-400 text-sm">Stake-weighted community rankings</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Settles</div>
            <div className="text-kindred-primary font-semibold">{getWeekEndDate()}</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                selectedCategory === cat.value
                  ? 'bg-kindred-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr className="text-left text-gray-500 text-sm">
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3 text-right">Score</th>
              <th className="px-6 py-3 text-right">Staked</th>
              <th className="px-6 py-3 text-right">Reviews</th>
              <th className="px-6 py-3 text-center">Change</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No data yet</td></tr>
            ) : entries.map((entry, index) => (
              <tr 
                key={entry.projectAddress}
                className={`border-t border-gray-800 hover:bg-gray-900/30 transition ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-400' :
                      entry.rank === 3 ? 'text-orange-400' : 'text-gray-600'
                    }`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold">{entry.projectName}</div>
                    <code className="text-xs text-gray-500">{truncateAddress(entry.projectAddress)}</code>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-kindred-primary/20 rounded text-kindred-primary font-semibold">
                    {entry.score}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-green-400 font-mono">
                    {(Number(entry.totalStaked) / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-gray-500">OPEN</div>
                </td>
                <td className="px-6 py-4 text-right text-gray-400">
                  {entry.reviewCount}
                </td>
                <td className="px-6 py-4 text-center">
                  {getRankChangeIcon(entry.weeklyChange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500">
          Rankings are calculated based on stake-weighted reviews. 
          <a href="/review" className="text-kindred-primary hover:underline ml-1">
            Submit your prediction →
          </a>
        </p>
      </div>
    </div>
  )
}
