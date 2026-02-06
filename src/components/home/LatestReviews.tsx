'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Review {
  id: string
  targetName: string
  targetAddress: string
  rating: number
  reviewerAddress: string
  content: string
  upvotes: number
  downvotes: number
  stakeAmount: string
  category: string
  createdAt: string
}

export function LatestReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews?sort=new&limit=3')
        const data = await res.json()
        setReviews(data.reviews || [])
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
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
            by {review.reviewerAddress.slice(0, 6)}...{review.reviewerAddress.slice(-4)}
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
