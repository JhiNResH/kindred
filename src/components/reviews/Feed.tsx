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
        setReviews(data.reviews || [])
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
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
          <div className="text-center py-12">
            <div className="text-[#6b6b70] mb-4">No reviews yet</div>
            <a 
              href="/review" 
              className="inline-block px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg text-white font-medium transition-colors"
            >
              Be the first to review
            </a>
          </div>
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
