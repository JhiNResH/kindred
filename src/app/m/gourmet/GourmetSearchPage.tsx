'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Star, TrendingUp, Clock, Utensils } from 'lucide-react'
import Link from 'next/link'

interface Restaurant {
  id: string
  name: string
  address: string
  reviewCount: number
  avgRating: number
}

interface GourmetSearchPageProps {
  recentRestaurants: Restaurant[]
}

export function GourmetSearchPage({ recentRestaurants }: GourmetSearchPageProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)

    try {
      // Search or create restaurant
      const res = await fetch('/api/gourmet/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query.trim() }),
      })

      const data = await res.json()

      if (data.slug) {
        // Navigate to restaurant page
        router.push(`/k/gourmet/${data.slug}`)
      } else {
        alert('Failed to find or create restaurant')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white pt-8">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
            <Utensils className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Maat Gourmet</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-transparent bg-clip-text">
            Verified Restaurant Reviews
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Search for any restaurant and share your dining experience. Community-powered ratings you can trust.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a restaurant... (e.g., 'Somni Los Angeles')"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-6 py-4 pr-14 text-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            Can't find it? We'll create a page for you to review!
          </p>
        </form>

        {/* Recently Searched Restaurants */}
        {recentRestaurants.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-2xl font-bold">Recently Searched</h2>
            </div>

            <div className="grid gap-4">
              {recentRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/k/gourmet/${generateSlug(restaurant.name)}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-orange-500 rounded-xl p-6 transition group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-400 transition">
                        {restaurant.name}
                      </h3>
                      {restaurant.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {restaurant.avgRating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-semibold">{restaurant.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                      {restaurant.reviewCount > 0 && (
                        <span className="text-sm text-gray-500">
                          {restaurant.reviewCount} {restaurant.reviewCount === 1 ? 'review' : 'reviews'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {recentRestaurants.length === 0 && (
          <div className="text-center py-16">
            <Utensils className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No restaurants searched yet. Be the first to search and review!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
