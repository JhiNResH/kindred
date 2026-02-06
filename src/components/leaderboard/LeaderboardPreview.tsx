'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardItem {
  rank: number
  name: string
  ticker: string
  score: number
  change: string
}

export function LeaderboardPreview() {
  const [items, setItems] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard?category=k/defi&limit=5')
        const data = await res.json()
        const entries = (data.entries || []).map((e: any, i: number) => ({
          rank: i + 1,
          name: e.projectName,
          ticker: e.projectName,
          score: e.score || 0,
          change: e.weeklyChange > 0 ? `+${e.weeklyChange}%` : e.weeklyChange < 0 ? `${e.weeklyChange}%` : '0%',
        }))
        setItems(entries)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  return (
    <section className="py-10 px-6 sm:px-12" id="leaderboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Top Rated Projects</h2>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 px-4 py-2 border border-[#2a2a2e] rounded-md text-[#adadb0] text-[13px] font-medium hover:bg-[#111113] hover:text-white transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-[#0f0f11] border-t border-[#2a2a2e] font-mono text-[11px]">
        {/* Header - Compact */}
        <div className="grid grid-cols-[30px_1fr_60px_60px] gap-2 px-3 py-2 bg-[#1a1a1d] border-b border-[#2a2a2e] text-[#6b6b70] uppercase tracking-wider font-semibold">
          <span className="text-center">#</span>
          <span>TICKER</span>
          <span className="text-right">SCORE</span>
          <span className="text-right">24H</span>
        </div>

        {/* Rows - Compact */}
        {loading ? (
          <div className="px-3 py-4 text-center text-[#6b6b70]">Loading...</div>
        ) : items.length === 0 ? (
          <div className="px-3 py-4 text-center text-[#6b6b70]">No data yet</div>
        ) : items.map((item) => (
          <div key={item.name} className="grid grid-cols-[30px_1fr_60px_60px] gap-2 px-3 py-2.5 border-b border-[#1f1f23]/50 hover:bg-[#1a1a1d] transition-colors items-center group text-[#adadb0] hover:text-white">
            <span className="text-center text-[#6b6b70]">{item.rank}</span>
            <div className="flex items-center gap-2">
               <span className="font-bold text-white group-hover:text-purple-400">{item.ticker}</span>
            </div>
            <span className="text-right font-medium">{item.score.toFixed(1)}</span>
            <div className={`text-right ${item.change.startsWith('+') ? 'text-green-500' : item.change.startsWith('-') ? 'text-red-500' : 'text-[#6b6b70]'}`}>
              {item.change}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
