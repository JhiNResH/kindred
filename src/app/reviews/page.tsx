'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewCard } from '@/components/ReviewCard'
import { CommunityInfo } from '@/components/CommunityInfo'

// Mock data for demo
const MOCK_REVIEWS = [
  {
    id: '1',
    targetAddress: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    reviewerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE23',
    rating: 5,
    content: 'Hyperliquid is absolutely crushing it. Best perp DEX UX I\'ve used - feels like a CEX but fully on-chain. Predicting #1 in k/perp-dex this week, they just launched new features. The funding rates significantly better than GMX right now.',
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
    content: 'Aave V3 is battle-tested DeFi infrastructure. Highest TVL, best risk management. Easy #1 in k/defi. Flash loans are working seamlessly.',
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
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Community Banner (for specific categories) */}
      {selectedCategory !== 'all' && (
        <div className="h-32 bg-gradient-to-r from-kindred-primary/10 to-purple-900/10 border-b border-[#1f1f23] flex items-end pb-6 px-8">
          <div className="max-w-7xl w-full mx-auto flex items-center gap-4">
            <div className="w-16 h-16 bg-kindred-dark border-4 border-[#0a0a0b] rounded-full flex items-center justify-center text-3xl shadow-xl">
              {categories.find(c => c.value === selectedCategory)?.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{categories.find(c => c.value === selectedCategory)?.label}</h1>
              <p className="text-sm text-gray-400">k/{selectedCategory.split('/')[1]}</p>
            </div>
            <button className="ml-auto px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition">
              Join
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Feed */}
        <div className="flex-1 max-w-3xl mx-auto w-full">
          {/* Create Post Input Trigger */}
          <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
              🦞
            </div>
            <Link 
              href="/review" 
              className="flex-1 bg-[#1a1a1d] hover:bg-[#2a2a2e] border border-[#2a2a2e] rounded-lg px-4 py-2 text-sm text-gray-400 transition text-left"
            >
              Create Post
            </Link>
            <button className="p-2 text-gray-400 hover:bg-[#1a1a1d] rounded-full">
              🖼️
            </button>
            <button className="p-2 text-gray-400 hover:bg-[#1a1a1d] rounded-full">
              🔗
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.value
                    ? 'bg-[#2a2a2e] text-white'
                    : 'text-gray-400 hover:bg-[#1a1a1d] hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="text-center py-12">
              <span className="animate-spin text-4xl">⏳</span>
              <p className="text-gray-400 mt-4">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 border border-[#1f1f23] rounded-xl bg-[#111113]">
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
        </div>

        {/* Right Sidebar (Community Info) */}
        <CommunityInfo category={selectedCategory} />
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1f1f23] py-8 text-center text-gray-500 mt-12 bg-[#0a0a0b]">
        <p>Built with 🦞 by Team Kindred for Openwork Hackathon 2025</p>
      </footer>
    </main>
  )
}
