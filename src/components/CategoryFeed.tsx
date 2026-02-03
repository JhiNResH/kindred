'use client'

import { useState } from 'react'
import { Flame, Clock, TrendingUp, Award, Filter, PenSquare } from 'lucide-react'
import { PostCard } from './PostCard'
import { PurchaseReviewCard } from './PurchaseReviewCard'

interface CategoryFeedProps {
  category: string
  categoryIcon?: string
  categoryDescription?: string
}

type SortOption = 'hot' | 'new' | 'top' | 'rising'

// Mock data - replace with API call
const MOCK_POSTS = [
  {
    id: '1',
    project: 'Hyperliquid',
    projectIcon: '⚡',
    category: 'k/perp-dex',
    rating: 4.8,
    author: '0xabcdef1234567890abcdef1234567890abcdef12',
    authorReputation: 1250,
    content: 'Best perp DEX by far. Execution is lightning fast, fees are competitive, and the UX is actually good. Been using it for 6 months now and never had any issues with liquidations or order fills.',
    upvotes: 342,
    comments: 48,
    staked: '25',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isNFT: true,
    nftPrice: '0.05',
  },
  {
    id: '2',
    project: 'Aave',
    projectIcon: '👻',
    category: 'k/defi',
    rating: 4.6,
    author: '0x1111222233334444555566667777888899990000',
    authorReputation: 850,
    content: 'Solid lending protocol with proven track record. V3 on multiple chains has been great. Only downside is gas fees on mainnet during congestion.',
    upvotes: 189,
    comments: 32,
    staked: '10',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    isNFT: false,
  },
  {
    id: '3',
    project: 'GMX',
    projectIcon: '📊',
    category: 'k/perp-dex',
    rating: 4.3,
    author: '0xdeadbeef1234567890abcdef1234567890abcdef',
    authorReputation: 420,
    content: 'Good for spot trading with leverage but the funding rates can be brutal during volatile periods. GLP has been a solid yield source though.',
    upvotes: 127,
    comments: 21,
    staked: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isNFT: true,
    nftPrice: '0.02',
  },
]

const MOCK_PREMIUM_POST = {
  id: 'premium-1',
  project: 'Ethena',
  projectIcon: '🌊',
  category: 'k/defi',
  rating: 4.2,
  author: '0xresearcher1234567890abcdef1234567890ab',
  authorReputation: 2100,
  previewContent: 'Deep dive into Ethena\'s USDe mechanism and risk analysis. This protocol has been controversial but the numbers are interesting...',
  fullContent: 'Full analysis: Ethena generates yield through delta-neutral strategies on centralized exchanges. Key risks include: 1) Custodial risk with CEXs, 2) Funding rate inversion risk, 3) Regulatory uncertainty. However, current APY of 27% is attractive if you understand the risks. My recommendation: allocate max 5% of portfolio with close monitoring.',
  isUnlocked: false,
  unlockPrice: '2',
  totalUnlocks: 156,
  upvotes: 89,
  totalStaked: '45',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  earlyVoterBonus: 15,
}

export function CategoryFeed({ 
  category, 
  categoryIcon = '📁',
  categoryDescription = 'Community reviews and predictions'
}: CategoryFeedProps) {
  const [sortBy, setSortBy] = useState<SortOption>('hot')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { value: 'new', label: 'New', icon: <Clock className="w-4 h-4" /> },
    { value: 'top', label: 'Top', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'rising', label: 'Rising', icon: <Award className="w-4 h-4" /> },
  ]

  // Filter posts by category
  const filteredPosts = MOCK_POSTS.filter(post => 
    category === 'all' || post.category === category
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Category Header */}
      <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{categoryIcon}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{category}</h1>
              <p className="text-[#6b6b70]">{categoryDescription}</p>
            </div>
          </div>
          <a
            href="/review"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            Write Review
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-[#2a2a2e]">
          <div>
            <span className="text-xl font-bold text-white">1.2k</span>
            <span className="text-sm text-[#6b6b70] ml-1">Reviews</span>
          </div>
          <div>
            <span className="text-xl font-bold text-white">8.5k</span>
            <span className="text-sm text-[#6b6b70] ml-1">Members</span>
          </div>
          <div>
            <span className="text-xl font-bold text-white">$45k</span>
            <span className="text-sm text-[#6b6b70] ml-1">Total Staked</span>
          </div>
        </div>
      </div>

      {/* Sort & Filter Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-[#111113] border border-[#2a2a2e] rounded-lg p-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-[#6b6b70] hover:text-white'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowPremiumOnly(!showPremiumOnly)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            showPremiumOnly
              ? 'border-purple-500 bg-purple-500/10 text-purple-400'
              : 'border-[#2a2a2e] text-[#6b6b70] hover:border-[#3a3a3e]'
          }`}
        >
          <Filter className="w-4 h-4" />
          Premium Only
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {/* Featured Premium Post */}
        {!showPremiumOnly && (
          <PurchaseReviewCard {...MOCK_PREMIUM_POST} />
        )}

        {/* Regular Posts */}
        {filteredPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}

        {/* Load More */}
        <button className="w-full py-3 bg-[#111113] border border-[#2a2a2e] rounded-lg text-[#6b6b70] hover:text-white hover:border-[#3a3a3e] transition-colors">
          Load More
        </button>
      </div>
    </div>
  )
}
