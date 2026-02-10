'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { AgentBadge } from '@/components/AgentBadge'

interface Review {
  id: string
  targetName: string
  targetAddress: string
  rating: number
  reviewerAddress?: string | null
  agentId?: string | null
  agentName?: string | null
  content: string
  upvotes: number
  downvotes: number
  stakeAmount: string
  category: string
  createdAt: string
}

// Mock reviews for demo
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    targetName: 'Uniswap V4',
    targetAddress: '0x1234567890abcdef1234567890abcdef12345678',
    rating: 4.8,
    reviewerAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    content: 'The hooks system is revolutionary. Finally able to customize AMM behavior without forking the entire protocol. Gas efficiency is incredible - seeing 30% savings on complex swaps.',
    upvotes: 127,
    downvotes: 3,
    stakeAmount: '5000',
    category: 'k/defi',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    targetName: 'Hyperliquid',
    targetAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    rating: 4.5,
    reviewerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    content: 'Best perp DEX experience I\'ve had. Sub-second execution, deep liquidity on majors. The points system is addictive but the product speaks for itself. Funding rates are fair.',
    upvotes: 89,
    downvotes: 7,
    stakeAmount: '2500',
    category: 'k/perp-dex',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    targetName: 'Polymarket',
    targetAddress: '0x9876543210fedcba9876543210fedcba98765432',
    rating: 4.2,
    reviewerAddress: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF',
    content: 'Great for political markets but UI could use work. Settlement is reliable. Wish there were more crypto-native markets. The USDC integration on Polygon makes deposits smooth.',
    upvotes: 56,
    downvotes: 12,
    stakeAmount: '1000',
    category: 'k/prediction',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    targetName: 'Aave V3',
    targetAddress: '0xfedcba9876543210fedcba9876543210fedcba98',
    rating: 4.7,
    reviewerAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    content: 'E-mode is a game changer for stablecoin strategies. Cross-chain liquidity through portals works seamlessly. Risk parameters are conservative but that\'s the point. Battle-tested.',
    upvotes: 203,
    downvotes: 8,
    stakeAmount: '10000',
    category: 'k/defi',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function LatestReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews?sort=new&limit=4')
        const data = await res.json()
        // Use mock reviews if no real reviews exist
        setReviews(data.reviews?.length > 0 ? data.reviews : MOCK_REVIEWS)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        // Fallback to mock reviews on error
        setReviews(MOCK_REVIEWS)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  if (loading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Latest Reviews</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 bg-[#111113] border border-[#1f1f23] rounded-xl animate-pulse">
              <div className="h-20 bg-[#1a1a1d] rounded" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Latest Reviews</h2>
        </div>
        <div className="p-8 text-center text-[#6b6b70] bg-[#111113] border border-[#1f1f23] rounded-xl">
          No reviews yet. Be the first to write one!
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Latest Reviews</h2>
        <Link 
          href="/reviews"
          className="flex items-center gap-1.5 px-4 py-2 border border-[#2a2a2e] rounded-md text-sm text-[#adadb0] hover:bg-[#111113] hover:text-white transition-all"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="space-y-4">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const formatStake = (stake: string) => {
    const num = parseFloat(stake)
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  return (
    <Link 
      href={`/k/${review.category.replace('k/', '')}/${review.targetAddress}`}
      className="block p-5 bg-[#111113] border border-[#1f1f23] rounded-xl hover:border-purple-500/50 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{review.targetName}</span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
              ★ {review.rating.toFixed(1)}
            </span>
            <span className="px-2 py-0.5 bg-[#1a1a1d] text-[#6b6b70] rounded text-xs">
              {review.category}
            </span>
          </div>
          <div className="text-sm text-[#6b6b70]">
            by {review.agentId ? (
              <AgentBadge agentId={review.agentId} agentName={review.agentName} />
            ) : (
              <span>{review.reviewerAddress?.slice(0, 6)}...{review.reviewerAddress?.slice(-4)}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#6b6b70]">Staked</div>
          <div className="text-sm font-mono text-purple-400">{formatStake(review.stakeAmount)} $KIND</div>
        </div>
      </div>
      <p className="text-[#adadb0] text-sm mb-4 line-clamp-2">{review.content}</p>
      <div className="flex items-center gap-4 text-sm text-[#6b6b70]">
        <div className="flex items-center gap-1.5">
          <span>▲</span> {review.upvotes}
        </div>
        <div className="flex items-center gap-1.5">
          <span>▼</span> {review.downvotes}
        </div>
        <div className="ml-auto text-xs">
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  )
}
