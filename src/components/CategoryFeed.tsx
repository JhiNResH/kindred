'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, Clock, TrendingUp, Award, Plus, SlidersHorizontal, Coins } from 'lucide-react'
import { StakeVote } from './StakeVote'
import { PaywallContent } from './PaywallContent'

type SortOption = 'hot' | 'new' | 'top' | 'controversial'

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

interface CategoryFeedProps {
  category: string
  categoryIcon: string
  categoryDescription: string
}

export function CategoryFeed({ category, categoryIcon, categoryDescription }: CategoryFeedProps) {
  const [sortBy, setSortBy] = useState<SortOption>('hot')
  const [showFilters, setShowFilters] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  
  // Fetch reviews for this category
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)
      try {
        const res = await fetch(`/api/reviews?category=${category}&sort=${sortBy}`)
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
  }, [category, sortBy])

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { value: 'new', label: 'New', icon: <Clock className="w-4 h-4" /> },
    { value: 'top', label: 'Top Staked', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'controversial', label: 'Controversial', icon: <Award className="w-4 h-4" /> },
  ]

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getReputationBadge = (rep: number) => {
    if (rep >= 2000) return { label: 'Legend', color: 'text-yellow-400 bg-yellow-500/10' }
    if (rep >= 1000) return { label: 'Expert', color: 'text-purple-400 bg-purple-500/10' }
    if (rep >= 500) return { label: 'Trusted', color: 'text-blue-400 bg-blue-500/10' }
    return { label: 'Active', color: 'text-green-400 bg-green-500/10' }
  }

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between p-4 bg-[#111113] border border-[#1f1f23] rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{categoryIcon}</span>
          <div>
            <h1 className="text-xl font-bold">{category}</h1>
            <p className="text-sm text-[#6b6b70]">{reviews.length} reviews • {categoryDescription}</p>
          </div>
        </div>
        <Link
          href={`/review?category=${category}`}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg text-white font-medium hover:translate-y-[-1px] hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Write Review
        </Link>
      </div>

      {/* Sort Bar */}
      <div className="flex items-center gap-2 p-2 bg-[#111113] border border-[#1f1f23] rounded-lg">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sortBy === option.value
                ? 'bg-[#1f1f23] text-white'
                : 'text-[#6b6b70] hover:bg-[#1a1a1d] hover:text-[#adadb0]'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[#6b6b70] hover:bg-[#1a1a1d] hover:text-[#adadb0] transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-[#6b6b70]">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-[#6b6b70]">No reviews yet. Be the first!</div>
        ) : (
          reviews.map((review) => {
          const repBadge = getReputationBadge(0) // TODO: Add reputation to API
          
          return (
            <div key={review.id} className="flex gap-4 bg-[#111113] border border-[#1f1f23] rounded-xl p-4 hover:border-[#2a2a2e] transition-colors">
              {/* Vote Column */}
              <StakeVote
                reviewId={review.id}
                initialUpvotes={review.upvotes}
                initialDownvotes={review.downvotes}
                totalStaked={review.stakeAmount}
                earlyBird={review.upvotes + review.downvotes < 20}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 text-xs text-[#6b6b70] mb-2 flex-wrap">
                  <span className="font-semibold text-[#adadb0]">{review.targetName}</span>
                  <span>•</span>
                  <span>by {review.reviewerAddress.slice(0, 6)}...{review.reviewerAddress.slice(-4)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${repBadge.color}`}>
                    {repBadge.label}
                  </span>
                  <span>•</span>
                  <span>{formatTimestamp(review.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <Coins className="w-3 h-3" />
                    {review.stakeAmount} $KIND staked
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-[#2a2a2e]'}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-[#6b6b70] ml-1">{review.rating}/5</span>
                </div>

                {/* Content */}
                <p className="text-[#adadb0] text-sm leading-relaxed">
                  {review.content}
                </p>
              </div>
            </div>
          )
          })
        )}
      </div>
    </div>
  )
}
