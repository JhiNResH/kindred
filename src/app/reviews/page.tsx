'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ReviewCard } from '@/components/ReviewCard'

// Mock data for demo
const MOCK_REVIEWS = [
  {
    id: '1',
    targetAddress: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    reviewerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE23',
    rating: 5,
    content: 'Hyperliquid is absolutely crushing it. Best perp DEX UX I\'ve used - feels like a CEX but fully on-chain. Predicting #1 in k/perp-dex this week, they just launched new features.',
    category: 'k/perp-dex',
    stakeAmount: '5000000000000000000',
    upvotes: 89,
    downvotes: 5,
    createdAt: '2025-01-28T10:30:00Z',
  },
  {
    id: '2',
    targetAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    reviewerAddress: '0x8ba1f109551bD432803012645Hac136c22b27',
    rating: 4,
    content: 'PEPE still has the strongest meme community. Volume is consistent and it\'s become a benchmark for the memecoin space. Holding #1 in k/memecoin for sure.',
    category: 'k/memecoin',
    stakeAmount: '10000000000000000000',
    upvotes: 234,
    downvotes: 45,
    createdAt: '2025-01-27T15:45:00Z',
  },
  {
    id: '3',
    targetAddress: '0x7890123456789012345678901234567890123456',
    reviewerAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    rating: 5,
    content: 'AI16Z is leading the AI agent narrative. Their framework is being adopted everywhere. Predicting it stays #1 in k/ai - no competition right now.',
    category: 'k/ai',
    stakeAmount: '8000000000000000000',
    upvotes: 156,
    downvotes: 12,
    createdAt: '2025-01-26T09:00:00Z',
  },
  {
    id: '4',
    targetAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    reviewerAddress: '0x1234567890123456789012345678901234567890',
    rating: 5,
    content: 'Aave V3 is battle-tested DeFi infrastructure. Highest TVL, best risk management. Easy #1 in k/defi.',
    category: 'k/defi',
    stakeAmount: '15000000000000000000',
    upvotes: 312,
    downvotes: 8,
    createdAt: '2025-01-25T12:00:00Z',
  },
]

type Category = 'all' | 'k/defi' | 'k/perp-dex' | 'k/memecoin' | 'k/ai'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS)
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [isLoading, setIsLoading] = useState(false)

  const filteredReviews = selectedCategory === 'all' 
    ? reviews 
    : reviews.filter(r => r.category === selectedCategory)

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'k/defi', label: 'DeFi', icon: '🏦' },
    { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈' },
    { value: 'k/memecoin', label: 'Memecoins', icon: '🐸' },
    { value: 'k/ai', label: 'AI Agents', icon: '🤖' },
  ]

  return (
    <main className="min-h-screen bg-kindred-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🦞</span>
          <span className="text-xl font-bold">Kindred</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/review" 
            className="bg-kindred-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            Write Review
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Reviews</h1>
          <p className="text-gray-400">
            Trusted reviews from the Kindred community, backed by real stakes
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                selectedCategory === cat.value
                  ? 'border-kindred-primary bg-kindred-primary/20 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-900/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-kindred-primary">{reviews.length}</div>
            <div className="text-xs text-gray-500">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {reviews.reduce((sum, r) => sum + Number(r.stakeAmount), 0) / 1e18}
            </div>
            <div className="text-xs text-gray-500">OPEN Staked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Avg Rating</div>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-12">
            <span className="animate-spin text-4xl">⏳</span>
            <p className="text-gray-400 mt-4">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 border border-gray-800 rounded-xl">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-400 mt-4">No reviews found in this category</p>
            <Link 
              href="/review"
              className="inline-block mt-4 text-kindred-primary hover:underline"
            >
              Be the first to write one →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredReviews.length > 0 && (
          <div className="text-center mt-8">
            <button className="text-gray-400 hover:text-white transition">
              Load more reviews...
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 mt-12">
        <p>Built with 🦞 by Team Kindred for Openwork Hackathon 2025</p>
      </footer>
    </main>
  )
}
