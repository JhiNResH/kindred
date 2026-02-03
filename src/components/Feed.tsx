'use client'

import { useState } from 'react'
import { Flame, Clock, TrendingUp, Award, SlidersHorizontal } from 'lucide-react'
import { PostCard } from './PostCard'

type SortOption = 'hot' | 'new' | 'top' | 'rising'

// Mock data
const MOCK_POSTS = [
  {
    id: '1',
    project: 'Hyperliquid',
    projectIcon: '💎',
    category: 'perp-dex',
    rating: 4.8,
    author: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE23',
    authorReputation: 1250,
    content: 'Best perp DEX I\'ve used. The execution speed is incredible - feels like a CEX but fully on-chain. UI is clean, fees are competitive. The only downside is the learning curve for new users. Overall, this is the future of derivatives trading.',
    upvotes: 847,
    comments: 156,
    staked: '2,500',
    timestamp: '2025-02-02T10:30:00Z',
    isNFT: true,
    nftPrice: '0.15',
  },
  {
    id: '2',
    project: 'PEPE',
    projectIcon: '🐸',
    category: 'memecoin',
    rating: 4.2,
    author: '0x8ba1f109551bD432803012645Hac136c22b27',
    authorReputation: 890,
    content: 'The OG memecoin of 2023. Community is still strong, volume is consistent. Not financial advice but this one has staying power compared to most memes. The memes are fire too 🔥',
    upvotes: 623,
    comments: 89,
    staked: '1,000',
    timestamp: '2025-02-02T08:15:00Z',
    isNFT: true,
  },
  {
    id: '3',
    project: 'Aave V3',
    projectIcon: '👻',
    category: 'defi',
    rating: 4.9,
    author: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    authorReputation: 2100,
    content: 'Battle-tested DeFi infrastructure. Highest TVL, best risk management in the space. The V3 upgrade brought efficiency mode and isolation mode which are game changers. This is the gold standard for lending protocols.',
    upvotes: 1243,
    comments: 234,
    staked: '5,000',
    timestamp: '2025-02-01T22:00:00Z',
    isNFT: true,
    nftPrice: '0.25',
  },
  {
    id: '4',
    project: 'AI16Z',
    projectIcon: '🤖',
    category: 'ai',
    rating: 4.5,
    author: '0x1234567890123456789012345678901234567890',
    authorReputation: 450,
    content: 'Leading the AI agent narrative. Their framework is being adopted across the ecosystem. The team ships fast and the community is engaged. Watching this space closely.',
    upvotes: 456,
    comments: 67,
    staked: '1,500',
    timestamp: '2025-02-02T06:45:00Z',
  },
  {
    id: '5',
    project: 'GMX V2',
    projectIcon: '🔵',
    category: 'perp-dex',
    rating: 4.6,
    author: '0x9876543210987654321098765432109876543210',
    authorReputation: 780,
    content: 'Solid perp DEX with great tokenomics. The GLP model is innovative - LPs providing liquidity while earning fees. V2 improvements make it more capital efficient. Competition is heating up but GMX has first mover advantage.',
    upvotes: 389,
    comments: 45,
    staked: '800',
    timestamp: '2025-02-02T04:20:00Z',
    isNFT: true,
  },
]

export function Feed() {
  const [sortBy, setSortBy] = useState<SortOption>('hot')
  const [showFilters, setShowFilters] = useState(false)

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { value: 'new', label: 'New', icon: <Clock className="w-4 h-4" /> },
    { value: 'top', label: 'Top', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'rising', label: 'Rising', icon: <Award className="w-4 h-4" /> },
  ]

  const sortedPosts = [...MOCK_POSTS].sort((a, b) => {
    switch (sortBy) {
      case 'hot':
        // Hot = upvotes * recency factor
        const aHot = a.upvotes * (1 / (Date.now() - new Date(a.timestamp).getTime()))
        const bHot = b.upvotes * (1 / (Date.now() - new Date(b.timestamp).getTime()))
        return bHot - aHot
      case 'new':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'top':
        return b.upvotes - a.upvotes
      case 'rising':
        // Rising = high engagement rate
        return (b.upvotes + b.comments * 5) - (a.upvotes + a.comments * 5)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-4">
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
        {sortedPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
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
