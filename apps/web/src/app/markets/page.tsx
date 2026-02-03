'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Search, TrendingUp, Filter, RefreshCw, ExternalLink } from 'lucide-react'
import { useMarkets } from '@/hooks'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'defi', label: 'DeFi' },
  { id: 'politics', label: 'Politics' },
  { id: 'sports', label: 'Sports' },
]

export default function MarketsPage() {
  const [category, setCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  
  const { markets, isLoading, error, refetch } = useMarkets({
    category: category === 'all' ? undefined : category,
    search: search || undefined,
    limit: 20,
    autoRefresh: 60000, // Refresh every minute
  })

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">🦞 KINDRED</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/app" className="text-sm text-[#adadb0] hover:text-white">App</Link>
            <Link href="/markets" className="text-sm text-purple-400">Markets</Link>
            <Link href="/leaderboard" className="text-sm text-[#adadb0] hover:text-white">Leaderboard</Link>
          </nav>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
          <p className="text-[#adadb0]">
            Live markets aggregated from Polymarket. Take positions and earn rewards.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-[#111113] border border-[#1f1f23] rounded-lg focus-within:border-purple-500">
            <Search className="w-4 h-4 text-[#6b6b70]" />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-[#6b6b70]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-[#111113] text-[#adadb0] border border-[#1f1f23] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#1f1f23] rounded-lg text-sm text-[#adadb0] hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && markets.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-[#6b6b70]">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading markets...</span>
            </div>
          </div>
        )}

        {/* Markets Grid */}
        <div className="grid gap-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && markets.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No markets found</h3>
            <p className="text-[#6b6b70]">Try adjusting your filters or search term</p>
          </div>
        )}
      </main>
    </div>
  )
}

function MarketCard({ market }: { market: any }) {
  const yesPrice = market.outcomes?.[0]?.price || 0.5
  const noPrice = market.outcomes?.[1]?.price || 0.5
  
  return (
    <div className="p-5 bg-[#111113] border border-[#1f1f23] rounded-xl hover:border-purple-500/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              market.source === 'polymarket' 
                ? 'bg-blue-500/10 text-blue-400' 
                : 'bg-purple-500/10 text-purple-400'
            }`}>
              {market.source}
            </span>
            <span className="px-2 py-0.5 bg-[#1f1f23] text-[#6b6b70] rounded text-xs">
              {market.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">{market.question}</h3>
          {market.endDate && (
            <p className="text-sm text-[#6b6b70]">
              Ends: {new Date(market.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {market.source === 'polymarket' && (
          <a
            href={`https://polymarket.com/event/${market.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#6b6b70] hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Outcomes */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors">
          <div className="text-xs text-green-400 mb-1">Yes</div>
          <div className="text-xl font-bold text-green-500">{(yesPrice * 100).toFixed(0)}¢</div>
        </button>
        <button className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors">
          <div className="text-xs text-red-400 mb-1">No</div>
          <div className="text-xl font-bold text-red-500">{(noPrice * 100).toFixed(0)}¢</div>
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-[#6b6b70]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          <span>Vol: ${formatNumber(parseFloat(market.volume || '0'))}</span>
        </div>
        <div>
          Liquidity: ${formatNumber(parseFloat(market.liquidity || '0'))}
        </div>
      </div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toFixed(0)
}
