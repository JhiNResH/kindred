'use client'

import { useState, useEffect } from 'react'
import { Flame, Clock, TrendingUp, Award, SlidersHorizontal } from 'lucide-react'
import { ReviewCard } from '@/components/reviews/ReviewCard'

type SortOption = 'hot' | 'new' | 'top' | 'rising'

interface Review {
  id: string
  targetAddress: string
  targetName: string
  reviewerAddress: string
  rating: number
  content: string
  category: string
  predictedRank: number | null
  stakeAmount: string
  photoUrls: string[]
  upvotes: number
  downvotes: number
  createdAt: string
}

// Mock reviews for demo
const MOCK_REVIEWS: Review[] = [
  {
    id: 'mock-1',
    targetAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    targetName: 'Uniswap',
    reviewerAddress: '0x872989F7fCd4048acA370161989d3904E37A3cB3',
    rating: 5,
    content: 'Uniswap V4 hooks are a game changer. The new architecture allows for unprecedented customization of liquidity pools. Fee tiers, TWAP oracles, and limit orders all in one protocol. This is the future of DeFi.',
    category: 'k/defi',
    predictedRank: 1,
    stakeAmount: '2500',
    photoUrls: [],
    upvotes: 142,
    downvotes: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    targetAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    targetName: 'Aave',
    reviewerAddress: '0x1234567890123456789012345678901234567890',
    rating: 4,
    content: 'Solid lending protocol with great security track record. The GHO stablecoin integration is interesting but still early. Flash loans are incredibly useful for arbitrage. Gas costs on mainnet are brutal though - use L2s.',
    category: 'k/defi',
    predictedRank: 3,
    stakeAmount: '1800',
    photoUrls: [],
    upvotes: 89,
    downvotes: 12,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    targetAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
    targetName: 'Chainlink',
    reviewerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    rating: 5,
    content: 'The backbone of DeFi oracles. CCIP is expanding Chainlink beyond just price feeds into cross-chain messaging. Every serious DeFi project relies on Chainlink data. The staking v0.2 is live and working well.',
    category: 'k/defi',
    predictedRank: 2,
    stakeAmount: '3200',
    photoUrls: [],
    upvotes: 203,
    downvotes: 15,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-4',
    targetAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    targetName: 'MakerDAO',
    reviewerAddress: '0x9876543210987654321098765432109876543210',
    rating: 4,
    content: 'DAI remains one of the most battle-tested stablecoins. The transition to "Sky" branding is confusing but the underlying protocol is solid. DSR rates are competitive. Governance can be slow but thorough.',
    category: 'k/defi',
    predictedRank: 5,
    stakeAmount: '1500',
    photoUrls: [],
    upvotes: 67,
    downvotes: 9,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-5',
    targetAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    targetName: 'Lido',
    reviewerAddress: '0xfedcba0987654321fedcba0987654321fedcba09',
    rating: 4,
    content: 'stETH is the most liquid ETH staking derivative. The centralization concerns are valid but they are actively working on distributed validator tech. APY is consistent. Easy to use with great DeFi integrations.',
    category: 'k/defi',
    predictedRank: 4,
    stakeAmount: '2100',
    photoUrls: [],
    upvotes: 118,
    downvotes: 21,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-6',
    targetAddress: '0xd533a949740bb3306d119cc777fa900ba034cd52',
    targetName: 'Curve Finance',
    reviewerAddress: '0x1111222233334444555566667777888899990000',
    rating: 5,
    content: 'Best DEX for stablecoin swaps, bar none. The ve-tokenomics model pioneered DeFi governance. crvUSD is gaining traction. UI could use improvement but the underlying math is beautiful. Low slippage king.',
    category: 'k/defi',
    predictedRank: 6,
    stakeAmount: '1900',
    photoUrls: [],
    upvotes: 95,
    downvotes: 7,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function Feed() {
  const [sortBy, setSortBy] = useState<SortOption>('hot')
  const [showFilters, setShowFilters] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?sort=${sortBy}`)
        const data = await res.json()
        const apiReviews = data.reviews || []
        // Use mock data if API returns empty
        setReviews(apiReviews.length > 0 ? apiReviews : MOCK_REVIEWS)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        // Fallback to mock data on error
        setReviews(MOCK_REVIEWS)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [sortBy])

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { value: 'new', label: 'New', icon: <Clock className="w-4 h-4" /> },
    { value: 'top', label: 'Top', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'rising', label: 'Rising', icon: <Award className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-4">
      {/* Sort Bar Hidden (Using external one) */}
      {/* 
      <div className="flex items-center gap-2 p-2 bg-[#111113] border border-[#1f1f23] rounded-lg">
        ...
      </div>
      */}

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-[#111113] border border-[#1f1f23] rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6b6b70] mb-2">Time</label>
              <select className="w-full bg-[#0a0a0b] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>All Time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b6b70] mb-2">Min Stake</label>
              <select className="w-full bg-[#0a0a0b] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white">
                <option>Any</option>
                <option>100+ $KIND</option>
                <option>500+ $KIND</option>
                <option>1000+ $KIND</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b6b70] mb-2">Rating</label>
              <select className="w-full bg-[#0a0a0b] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white">
                <option>All Ratings</option>
                <option>4+ Stars</option>
                <option>3+ Stars</option>
                <option>2+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-[#6b6b70]">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-[#6b6b70]">No reviews yet. Be the first!</div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Load More */}
      <div className="text-center py-4">
        <button className="px-6 py-2 bg-[#1f1f23] hover:bg-[#2a2a2e] rounded-full text-sm font-medium text-[#adadb0] transition-colors">
          Load More Reviews
        </button>
      </div>
    </div>
  )
}
