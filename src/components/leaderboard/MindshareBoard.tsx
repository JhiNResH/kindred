'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { TrendingUp, TrendingDown, Minus, Flame, Clock, Award, BarChart3, ArrowUpRight, ThumbsUp, ThumbsDown } from 'lucide-react'

type Category = 'all' | 'k/defi' | 'k/perp-dex' | 'k/ai' | 'k/memecoin' | 'k/prediction' | 'k/infra'

const CATEGORIES = [
  { id: 'all' as Category, label: 'All', icon: BarChart3 },
  { id: 'k/defi' as Category, label: 'DeFi', icon: Award },
  { id: 'k/perp-dex' as Category, label: 'Perp DEX', icon: TrendingUp },
  { id: 'k/prediction' as Category, label: 'Prediction', icon: Flame },
  { id: 'k/ai' as Category, label: 'AI Agents', icon: Clock },
  { id: 'k/memecoin' as Category, label: 'Memecoins', icon: Flame },
]

const CATEGORY_COLORS: Record<string, string> = {
  'k/defi': '#8b5cf6',
  'k/perp-dex': '#3b82f6',
  'k/prediction': '#ec4899',
  'k/ai': '#10b981',
  'k/memecoin': '#f59e0b',
  'k/infra': '#6366f1',
}

interface LeaderboardEntry {
  rank: number
  projectAddress: string
  projectName: string
  category: string
  image: string | null
  avgRating: number
  reviewCount: number
  totalStaked: string
  weeklyChange: number
  predictedRank: number | null
  bullishCount?: number
  bearishCount?: number
}

function formatNumber(n: number): string {
  if (n === undefined || isNaN(n)) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) return <div className="flex items-center text-green-400 text-xs font-bold gap-0.5"><TrendingUp className="w-3 h-3" />+{value}%</div>
  if (value < 0) return <div className="flex items-center text-red-400 text-xs font-bold gap-0.5"><TrendingDown className="w-3 h-3" />{value}%</div>
  return <div className="flex items-center text-[#6b6b70] text-xs font-bold gap-0.5"><Minus className="w-3 h-3" />0%</div>
}

function MindshareBar({ value, maxValue, color }: { value: number, maxValue: number, color: string }) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  return (
    <div className="h-1.5 w-full bg-[#1a1a1d] rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500" 
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  )
}

function SentimentDot({ value }: { value: number }) {
  let color = 'bg-gray-500'
  if (value >= 4) color = 'bg-green-500'
  else if (value >= 3) color = 'bg-yellow-500'
  else color = 'bg-red-500'
  
  return (
    <div className={`w-2 h-2 rounded-full ${color}`} title={`Rating: ${value}`} />
  )
}

export function MindshareBoard() {
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get('category') as Category
  
  const [category, setCategory] = useState<Category>('all')
  const [timeRange, setTimeRange] = useState<string>('7d')
  const [projects, setProjects] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, 'bullish' | 'bearish'>>({})
  const [votingId, setVotingId] = useState<string | null>(null)

  // Handle vote
  const handleVote = async (projectId: string, sentiment: 'bullish' | 'bearish') => {
    setVotingId(projectId)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, sentiment })
      })
      const data = await res.json()
      if (data.success) {
        setUserVotes(prev => ({ ...prev, [projectId]: sentiment }))
        // Update local project stats
        setProjects(prev => prev.map(p => 
          p.projectAddress === projectId 
            ? { ...p, bullishCount: data.projectStats.bullishCount, bearishCount: data.projectStats.bearishCount }
            : p
        ))
      }
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setVotingId(null)
    }
  }
  
  // Sync state with URL params
  useEffect(() => {
    if (urlCategory && CATEGORIES.some(c => c.id === urlCategory)) {
      setCategory(urlCategory)
    } else {
      setCategory('all')
    }
  }, [urlCategory])

  // Fetch from API
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      try {
        const url = category === 'all' 
          ? '/api/leaderboard?limit=50'
          : `/api/leaderboard?category=${category}&limit=50`
        const res = await fetch(url)
        const data = await res.json()
        setProjects(data.leaderboard || [])
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [category])

  // Map API data to UI format
  const uiProjects = projects.map((p, index) => {
    const color = CATEGORY_COLORS[p.category] || '#8b5cf6'
    const mindshare = p.avgRating * 20 // Convert 5-star to percentage
    const staked = parseInt(p.totalStaked || '0') / 1e18 // Convert from wei
    
    return {
      id: p.projectAddress,
      name: p.projectName,
      ticker: p.projectName.toUpperCase().slice(0, 4),
      image: p.image,
      category: p.category,
      rank: p.rank,
      mindshare,
      mindshareChange: p.weeklyChange,
      bullishCount: p.bullishCount || 0,
      bearishCount: p.bearishCount || 0,
      staked,
      reviewsCount: p.reviewCount,
      sentiment: p.avgRating,
      color,
    }
  })

  const maxMindshare = Math.max(...uiProjects.map(e => e.mindshare), 100)
  const totalMindshare = uiProjects.reduce((sum, e) => sum + e.mindshare, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Mindshare</h1>
          <p className="text-[#6b6b70]">Community attention across Web3 projects</p>
        </div>
        
        {/* Time Range */}
        <div className="flex items-center gap-1 bg-[#111113] rounded-lg p-1 border border-[#1f1f23]">
          {['24h', '7d', '30d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                timeRange === t
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-[#6b6b70] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top Mindshare Cards */}
      {!loading && uiProjects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {uiProjects.slice(0, 4).map((entry) => (
            <div key={entry.id} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4 hover:border-[#2a2a2e] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold overflow-hidden" style={{ backgroundColor: entry.color + '20', color: entry.color }}>
                    {entry.image ? (
                      <Image src={entry.image} alt={entry.name} width={32} height={32} className="w-full h-full object-contain" />
                    ) : (
                      entry.ticker.slice(0, 2)
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{entry.ticker}</div>
                    <div className="text-xs text-[#6b6b70]">#{entry.rank}</div>
                  </div>
                </div>
                <ChangeIndicator value={entry.mindshareChange} />
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: entry.color }}>
                {entry.mindshare.toFixed(1)}%
              </div>
              <MindshareBar value={entry.mindshare} color={entry.color} maxValue={maxMindshare} />
            </div>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const href = cat.id === 'all' ? '/leaderboard' : `/leaderboard?category=${cat.id}`
          
          return (
            <Link
              key={cat.id}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-[#6b6b70] hover:text-white hover:bg-[#111113] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1f1f23] text-xs font-medium text-[#6b6b70] uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Project</div>
          <div className="col-span-2">Mindshare</div>
          <div className="col-span-1 text-right">Change</div>
          <div className="col-span-1 text-right">Staked</div>
          <div className="col-span-1 text-right">Reviews</div>
          <div className="col-span-1 text-right">Rating</div>
          <div className="col-span-2 text-center">Vote</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-8 text-center text-[#6b6b70]">Loading...</div>
        )}

        {/* Empty State */}
        {!loading && uiProjects.length === 0 && (
          <div className="px-6 py-8 text-center text-[#6b6b70]">No projects found</div>
        )}

        {/* Rows */}
        {!loading && uiProjects.map((entry, i) => (
          <Link
            key={entry.id}
            href={`/${entry.category}/${entry.id}`}
            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a1a1d] transition-colors cursor-pointer ${
              i !== uiProjects.length - 1 ? 'border-b border-[#1a1a1d]' : ''
            }`}
          >
            {/* Rank */}
            <div className="col-span-1">
              <span className={`text-sm font-bold ${entry.rank <= 3 ? 'text-purple-400' : 'text-[#6b6b70]'}`}>
                {entry.rank}
              </span>
            </div>

            {/* Project */}
            <div className="col-span-3 flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
                style={{ backgroundColor: entry.color + '15', color: entry.color }}
              >
                {entry.image ? (
                  <Image src={entry.image} alt={entry.name} width={40} height={40} className="w-full h-full object-contain" />
                ) : (
                  entry.ticker.slice(0, 3)
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{entry.name}</div>
                <div className="text-xs text-[#6b6b70]">{entry.category}</div>
              </div>
            </div>

            {/* Mindshare */}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold min-w-[48px]" style={{ color: entry.color }}>
                  {entry.mindshare.toFixed(1)}%
                </span>
                <div className="flex-1">
                  <MindshareBar value={entry.mindshare} color={entry.color} maxValue={maxMindshare} />
                </div>
              </div>
            </div>

            {/* Change */}
            <div className="col-span-1 text-right">
              <ChangeIndicator value={entry.mindshareChange} />
            </div>

            {/* Staked */}
            <div className="col-span-1 text-right">
              <span className="text-sm text-[#adadb0]">{formatNumber(entry.staked)}</span>
            </div>

            {/* Reviews */}
            <div className="col-span-1 text-right">
              <span className="text-sm text-[#adadb0]">{entry.reviewsCount}</span>
            </div>

            {/* Rating */}
            <div className="col-span-1 flex justify-end">
              <SentimentDot value={entry.sentiment} />
            </div>

            {/* Vote Buttons */}
            <div className="col-span-2 flex justify-center items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleVote(entry.id, 'bullish')
                }}
                disabled={votingId === entry.id}
                className={`p-1.5 rounded-lg transition-colors ${
                  userVotes[entry.id] === 'bullish'
                    ? 'bg-green-500/30 text-green-300 ring-1 ring-green-500'
                    : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                }`}
                title="Bullish"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="text-xs text-[#6b6b70] min-w-[32px] text-center">
                {((entry.bullishCount || 0) + (entry.bearishCount || 0)) > 0
                  ? `${Math.round(((entry.bullishCount || 0) / ((entry.bullishCount || 0) + (entry.bearishCount || 0))) * 100)}%`
                  : '-'}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleVote(entry.id, 'bearish')
                }}
                disabled={votingId === entry.id}
                className={`p-1.5 rounded-lg transition-colors ${
                  userVotes[entry.id] === 'bearish'
                    ? 'bg-red-500/30 text-red-300 ring-1 ring-red-500'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                }`}
                title="Bearish"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 px-2 text-sm text-[#6b6b70]">
        <span>Showing {uiProjects.length} projects</span>
        <span>Total mindshare tracked: {totalMindshare.toFixed(1)}%</span>
      </div>
    </div>
  )
}
