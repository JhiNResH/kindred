'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { 
  ArrowLeft, ExternalLink, Clock, TrendingUp, 
  DollarSign, Users, Share2, Bell
} from 'lucide-react'
import { useMarket } from '@/hooks'
import { TradeModal } from '@/components/TradeModal'

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { market, isLoading, error } = useMarket(id)
  const { isConnected } = useAccount()
  const [tradeModal, setTradeModal] = useState<{ isOpen: boolean; side: 'yes' | 'no' }>({
    isOpen: false,
    side: 'yes',
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
          <p className="text-[#6b6b70] mb-8">{error || 'This market does not exist or has been removed.'}</p>
          <Link href="/markets" className="px-6 py-3 bg-purple-500 rounded-lg font-medium hover:bg-purple-600 transition-colors">
            Browse Markets
          </Link>
        </div>
      </div>
    )
  }

  const yesPrice = market.outcomes?.[0]?.price || 0.5
  const noPrice = market.outcomes?.[1]?.price || 0.5
  const volume = parseFloat(market.volume || '0')
  const liquidity = parseFloat(market.liquidity || '0')

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">🦞 KINDRED</span>
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Link */}
        <Link href="/markets" className="inline-flex items-center gap-2 text-[#6b6b70] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </Link>

        {/* Market Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              market.source === 'polymarket' 
                ? 'bg-blue-500/10 text-blue-400' 
                : 'bg-purple-500/10 text-purple-400'
            }`}>
              {market.source}
            </span>
            <span className="px-2 py-1 bg-[#1f1f23] text-[#6b6b70] rounded text-xs">
              {market.category}
            </span>
            {market.resolved && (
              <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
                Resolved
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{market.question}</h1>
          
          {market.description && (
            <p className="text-[#adadb0] mb-4">{market.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#6b6b70]">
            {market.endDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Ends: {new Date(market.endDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Volume: ${formatNumber(volume)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Liquidity: ${formatNumber(liquidity)}</span>
            </div>
          </div>
        </div>

        {/* Trading Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Yes Card */}
          <div className="p-6 bg-[#111113] border border-green-500/30 rounded-xl">
            <div className="text-center mb-6">
              <div className="text-sm text-green-400 mb-2">Yes</div>
              <div className="text-5xl font-bold text-green-500 mb-2">
                {(yesPrice * 100).toFixed(1)}¢
              </div>
              <div className="text-sm text-[#6b6b70]">
                {(yesPrice * 100).toFixed(1)}% chance
              </div>
            </div>
            
            {isConnected ? (
              <button 
                onClick={() => setTradeModal({ isOpen: true, side: 'yes' })}
                className="w-full py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Buy Yes
              </button>
            ) : (
              <div className="text-center text-sm text-[#6b6b70]">
                Connect wallet to trade
              </div>
            )}
          </div>

          {/* No Card */}
          <div className="p-6 bg-[#111113] border border-red-500/30 rounded-xl">
            <div className="text-center mb-6">
              <div className="text-sm text-red-400 mb-2">No</div>
              <div className="text-5xl font-bold text-red-500 mb-2">
                {(noPrice * 100).toFixed(1)}¢
              </div>
              <div className="text-sm text-[#6b6b70]">
                {(noPrice * 100).toFixed(1)}% chance
              </div>
            </div>
            
            {isConnected ? (
              <button 
                onClick={() => setTradeModal({ isOpen: true, side: 'no' })}
                className="w-full py-3 bg-red-500 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Buy No
              </button>
            ) : (
              <div className="text-center text-sm text-[#6b6b70]">
                Connect wallet to trade
              </div>
            )}
          </div>
        </div>

        {/* Trade Modal */}
        {market && (
          <TradeModal
            market={market}
            side={tradeModal.side}
            isOpen={tradeModal.isOpen}
            onClose={() => setTradeModal({ ...tradeModal, isOpen: false })}
            onSuccess={(position) => {
              console.log('Position created:', position)
              // Could show a success toast here
            }}
          />
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          {market.polymarketUrl && (
            <a
              href={market.polymarketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#1f1f23] rounded-lg text-sm hover:border-purple-500/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Trade on Polymarket
            </a>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#1f1f23] rounded-lg text-sm hover:border-purple-500/30 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#1f1f23] rounded-lg text-sm hover:border-purple-500/30 transition-colors">
            <Bell className="w-4 h-4" />
            Set Alert
          </button>
        </div>

        {/* Market Stats */}
        <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-xl mb-8">
          <h2 className="text-lg font-semibold mb-4">Market Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-[#6b6b70] mb-1">24h Volume</div>
              <div className="text-xl font-bold">${formatNumber(volume * 0.1)}</div>
            </div>
            <div>
              <div className="text-sm text-[#6b6b70] mb-1">Total Volume</div>
              <div className="text-xl font-bold">${formatNumber(volume)}</div>
            </div>
            <div>
              <div className="text-sm text-[#6b6b70] mb-1">Liquidity</div>
              <div className="text-xl font-bold">${formatNumber(liquidity)}</div>
            </div>
            <div>
              <div className="text-sm text-[#6b6b70] mb-1">Traders</div>
              <div className="text-xl font-bold">{Math.floor(volume / 1000)}</div>
            </div>
          </div>
        </div>

        {/* Related Markets */}
        <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Related Markets</h2>
            <Link href={`/markets?category=${market.category}`} className="text-sm text-purple-400 hover:text-purple-300">
              View all {market.category}
            </Link>
          </div>
          <p className="text-[#6b6b70] text-sm">
            Explore more {market.category} prediction markets →
          </p>
        </div>
      </main>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toFixed(0)
}
