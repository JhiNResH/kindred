'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Users, TrendingUp, ArrowLeft, ExternalLink, Award, Utensils, Camera, Clock, DollarSign, ChefHat } from 'lucide-react'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewCard } from '@/components/reviews/ReviewCard'

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
  nftTokenId?: string
}

interface Restaurant {
  id: string
  name: string
  address: string
  description: string | null
  website: string | null
  avgRating: number
  reviewCount: number
  totalStaked: string
  reviews: Review[]
}

interface RestaurantInfo {
  platformScores?: Array<{ platform: string; score: string; reviewCount?: number }>
  cuisine?: string
  priceRange?: string
  avgCost?: string
  hours?: string
  address?: string
  googleMapsUrl?: string
  bestFor?: string[]
  mustTry?: Array<{ name: string; price?: string; description?: string }>
  warnings?: string[]
  criticalReviews?: Array<{ issue: string; source?: string } | string>
}

interface RestaurantPageProps {
  restaurant: Restaurant
}

export function RestaurantPage({ restaurant }: RestaurantPageProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const averageRating = restaurant.avgRating

  // Fetch restaurant details from Gemini API (FREE basic info)
  useEffect(() => {
    async function fetchRestaurantInfo() {
      try {
        console.log('[RestaurantPage] Fetching info for:', restaurant.name)
        
        const res = await fetch('/api/gourmet/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantName: restaurant.name }),
        })
        
        if (res.ok) {
          const data = await res.json()
          console.log('[RestaurantPage] Received info:', data)
          setRestaurantInfo(data)
        } else {
          console.error('[RestaurantPage] API error:', res.status, await res.text())
          // Still set loading to false even on error
        }
      } catch (error) {
        console.error('[RestaurantPage] Failed to fetch restaurant info:', error)
      } finally {
        setLoadingInfo(false)
      }
    }

    fetchRestaurantInfo()
  }, [restaurant.name])

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/k/gourmet"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gourmet
        </Link>

        {/* Restaurant Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="w-8 h-8 text-orange-400" />
                <h1 className="text-4xl font-bold">{restaurant.name}</h1>
              </div>

              {restaurant.description && (
                <p className="text-gray-300 text-lg mb-4">{restaurant.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm">
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold text-yellow-400">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                )}

                {restaurant.reviewCount > 0 && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{restaurant.reviewCount} {restaurant.reviewCount === 1 ? 'review' : 'reviews'}</span>
                  </div>
                )}

                {Number(restaurant.totalStaked) > 0 && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <Award className="w-4 h-4" />
                    <span>{(Number(restaurant.totalStaked) / 1e18).toFixed(0)} $OPEN staked</span>
                  </div>
                )}
              </div>

              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mt-4 transition"
                >
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Write Review
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8">
                <ReviewForm />
              </div>
            )}

            {/* Reviews List */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Community Reviews</h2>

              {restaurant.reviews.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                  <Utensils className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-6">
                    No reviews yet. Be the first to review {restaurant.name}!
                  </p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Write the First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {restaurant.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Restaurant Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" />
                Restaurant Stats
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Rating</span>
                  <span className="font-semibold text-yellow-400">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} / 5.0` : 'No ratings'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Total Reviews</span>
                  <span className="font-semibold">{restaurant.reviewCount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Total Staked</span>
                  <span className="font-semibold text-purple-400">
                    {(Number(restaurant.totalStaked) / 1e18).toFixed(0)} $OPEN
                  </span>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm text-gray-500">
                    Kindred Gourmet uses stake-weighted reviews to ensure authentic, high-quality ratings.
                  </p>
                </div>
              </div>
            </div>

            {/* Restaurant Info (from Maat API) */}
            {loadingInfo ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ) : restaurantInfo ? (
              <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  Restaurant Info
                </h3>

                <div className="space-y-4">
                  {/* Platform Ratings */}
                  {restaurantInfo.platformScores && restaurantInfo.platformScores.length > 0 && (
                    <div className="pb-3 border-b border-gray-700">
                      <span className="text-xs text-gray-400 uppercase block mb-2">⭐ Platform Ratings</span>
                      <div className="flex flex-wrap gap-2">
                        {restaurantInfo.platformScores.map((ps, i) => (
                          <div key={i} className="bg-black/30 border border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <span className="text-xs text-gray-400">{ps.platform}</span>
                            <span className="text-sm font-bold text-orange-400">{ps.score}</span>
                            {ps.reviewCount && <span className="text-[10px] text-gray-500">({ps.reviewCount})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cuisine */}
                  {restaurantInfo.cuisine && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        Cuisine
                      </span>
                      <span className="text-sm font-semibold text-gray-300">{restaurantInfo.cuisine}</span>
                    </div>
                  )}

                  {/* Price Range */}
                  {restaurantInfo.priceRange && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price Range
                      </span>
                      <span className="text-sm font-semibold text-orange-400">{restaurantInfo.priceRange}</span>
                    </div>
                  )}

                  {/* Average Cost */}
                  {restaurantInfo.avgCost && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase">Avg Cost</span>
                      <span className="text-sm text-gray-300">{restaurantInfo.avgCost}</span>
                    </div>
                  )}

                  {/* Hours */}
                  {restaurantInfo.hours && (
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-400 uppercase flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4" />
                        Hours
                      </span>
                      <span className="text-sm text-gray-300">{restaurantInfo.hours}</span>
                    </div>
                  )}

                  {/* Address */}
                  {restaurantInfo.address && (
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-400 uppercase flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4" />
                        Address
                      </span>
                      <span className="text-sm text-gray-300">{restaurantInfo.address}</span>
                    </div>
                  )}

                  {/* Google Maps Link */}
                  {restaurantInfo.googleMapsUrl && (
                    <div className="pt-3 border-t border-gray-700">
                      <a 
                        href={restaurantInfo.googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition"
                      >
                        <MapPin className="w-4 h-4" />
                        View on Google Maps
                      </a>
                    </div>
                  )}

                  {/* Best For Tags */}
                  {restaurantInfo.bestFor && restaurantInfo.bestFor.length > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                      <span className="text-xs text-gray-400 uppercase block mb-2">Best For</span>
                      <div className="flex flex-wrap gap-2">
                        {restaurantInfo.bestFor.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Must Try Dishes */}
                  {restaurantInfo.mustTry && restaurantInfo.mustTry.length > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                      <span className="text-xs text-gray-400 uppercase block mb-2">🌟 Must Try</span>
                      <div className="space-y-2">
                        {restaurantInfo.mustTry.slice(0, 5).map((dish, i) => (
                          <div key={i} className="bg-black/20 p-2 rounded text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{dish.name}</span>
                              {dish.price && <span className="text-orange-400">{dish.price}</span>}
                            </div>
                            {dish.description && <p className="text-xs text-gray-400 mt-1">{dish.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {restaurantInfo.warnings && restaurantInfo.warnings.length > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                      <span className="text-xs text-yellow-400 uppercase block mb-2">⚠️ 注意事項</span>
                      <ul className="space-y-1">
                        {restaurantInfo.warnings.map((w, i) => (
                          <li key={i} className="text-sm text-yellow-200/80">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Critical Reviews */}
                  {restaurantInfo.criticalReviews && restaurantInfo.criticalReviews.length > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                      <span className="text-xs text-red-400 uppercase block mb-2">😤 常見差評</span>
                      <ul className="space-y-1">
                        {restaurantInfo.criticalReviews.map((cr, i) => {
                          const issue = typeof cr === 'string' ? cr : cr.issue
                          const source = typeof cr === 'string' ? null : cr.source
                          return (
                            <li key={i} className="text-sm text-red-200/80">
                              • {issue} {source && <span className="text-red-400/60">({source})</span>}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
