'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { TrendingUp, TrendingDown, Minus, ChevronDown, Flame, Clock, Award, BarChart3, ArrowUpRight } from 'lucide-react'

import { useStore } from '@/lib/store'

type Category = 'all' | 'k/defi' | 'k/perp-dex' | 'k/ai' | 'k/memecoin'

const CATEGORIES = [
  { id: 'all' as Category, label: 'All', icon: BarChart3 },
  { id: 'k/defi' as Category, label: 'DeFi', icon: Award },
  { id: 'k/perp-dex' as Category, label: 'Perp DEX', icon: TrendingUp },
  { id: 'k/ai' as Category, label: 'AI Agents', icon: Flame },
  { id: 'k/memecoin' as Category, label: 'Memecoins', icon: Clock },
]

function formatNumber(n: number): string {
  if (n === undefined) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

// Helper Components
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
  // Value 0-100
  let color = 'bg-gray-500'
  if (value >= 66) color = 'bg-green-500'
  else if (value >= 33) color = 'bg-yellow-500'
  else color = 'bg-red-500'
  
  return (
    <div className={`w-2 h-2 rounded-full ${color}`} title={`Sentiment: ${value}`} />
  )
}

export function MindshareBoard() {
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get('category') as Category
  
  const [category, setCategory] = useState<Category>('all')
  const [timeRange, setTimeRange] = useState<string>('7d')
  
  // Sync state with URL params
  useEffect(() => {
    if (urlCategory && CATEGORIES.some(c => c.id === urlCategory)) {
      setCategory(urlCategory)
    } else {
      setCategory('all')
    }
  }, [urlCategory])

  // Use global dynamic store
  const projects = useStore(state => state.projects)

  // Map store projects to UI format (if needed) or use directly
  // The store uses 'score' as main metric, we can map to mindshare for UI compat or rename
  const uiProjects = projects.map((p, index) => ({
    ...p,
    rank: index + 1, // Fix missing rank
    mindshare: p.score * 20, // Map 5.0 score to 100% scale for visualization if needed, or just use raw
    mindshareChange: 0, // No historical data in lightweight store yet
    staked: 0, // Mock for now
    sentiment: p.score * 20,
    color: '#8b5cf6' // Default purple
  }))

  const filtered = category === 'all' 
    ? uiProjects 
    : uiProjects.filter(e => e.category === category) // Note: Store needs category field on Project

  const maxMindshare = Math.max(...filtered.map(e => e.mindshare), 100)
  const totalMindshare = filtered.reduce((sum, e) => sum + e.mindshare, 0)

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {filtered.slice(0, 4).map((entry) => (
          <div key={entry.name} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4 hover:border-[#2a2a2e] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: entry.color + '20', color: entry.color }}>
                  {entry.ticker.slice(0, 2)}
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

      {/* Category Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const href = cat.id === 'all' ? '/leaderboard' : `/k/${cat.id.replace('k/', '')}`
          
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
          <div className="col-span-3">Mindshare</div>
          <div className="col-span-1 text-right">Change</div>
          <div className="col-span-1 text-right">Staked</div>
          <div className="col-span-1 text-right">Reviews</div>
          <div className="col-span-1 text-right">Sentiment</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {filtered.map((entry, i) => (
          <Link
            key={entry.name}
            href={`/${entry.category}/${entry.id}`}
            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a1a1d] transition-colors cursor-pointer ${
              i !== filtered.length - 1 ? 'border-b border-[#1a1a1d]' : ''
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
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: entry.color + '15', color: entry.color }}
              >
                {entry.ticker.slice(0, 3)}
              </div>
              <div>
                <div className="text-sm font-semibold">{entry.name}</div>
                <div className="text-xs text-[#6b6b70]">{entry.ticker}</div>
              </div>
            </div>

            {/* Mindshare */}
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold min-w-[52px]" style={{ color: entry.color }}>
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

            {/* Sentiment */}
            <div className="col-span-1 flex justify-end">
              <SentimentDot value={entry.sentiment} />
            </div>

            {/* Arrow */}
            <div className="col-span-1 flex justify-end">
              <ArrowUpRight className="w-4 h-4 text-[#6b6b70]" />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 px-2 text-sm text-[#6b6b70]">
        <span>Showing {filtered.length} projects</span>
        <span>Total mindshare tracked: {totalMindshare.toFixed(1)}%</span>
      </div>
    </div>
  )
}
