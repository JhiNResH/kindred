'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AISummaryCard } from '@/components/AISummaryCard'
import { ReviewCard } from '@/components/ReviewCard'
import { CommunityInfo } from '@/components/CommunityInfo'

// Mock Data Database
const PROJECT_DATA: Record<string, any> = {
  'hyperliquid': {
    name: 'Hyperliquid',
    category: 'k/perp-dex',
    aiVerdict: 'bullish',
    score: 92,
    summary: 'Hyperliquid has established itself as the leading on-chain perp DEX with CEX-like performance. User sentiment is overwhelmingly positive due to low fees, high throughput, and the new spot trading features.',
    keyPoints: [
      'Fastest execution speed in class (L1)',
      'Community loves the points program and airdrop speculation',
      'Volume consistently flipping major competitors',
      'Minor concerns about centralization of the validator set'
    ]
  },
  'uniswap': {
    name: 'Uniswap',
    category: 'k/defi',
    aiVerdict: 'neutral',
    score: 85,
    summary: 'Uniswap remains the AMM king but faces stiff competition and fee fatigue. v4 hooks are highly anticipated but v3 concentration management remains a pain point for casual LPs.',
    keyPoints: [
      'Unchallenged TVL dominance',
      'v4 Hooks generating developer excitement',
      'Governance proposals causing some friction',
      'User experience still relies heavily on aggregators'
    ]
  },
  'pepe': {
    name: 'PEPE',
    category: 'k/memecoin',
    aiVerdict: 'bullish',
    score: 88,
    summary: 'PEPE has solidified its status as a blue-chip meme. The community is resilient and distribution is well-spread. Recent volume spikes suggest another leg up is forming.',
    keyPoints: [
      'Strongest culturally relevant meme since DOGE',
      'Holder count growing steadily',
      'No utility, purely vibes (as expected)',
      'Whale accumulation detected on-chain'
    ]
  }
}

// Fallback for unknown projects
const GENERIC_DATA = (name: string) => ({
  name: name,
  category: 'k/defi',
  aiVerdict: 'neutral',
  score: 70,
  summary: `Analysis for ${name} is preliminary. Community sentiment is mixed with limited data points. More reviews are needed to form a confident verdict.`,
  keyPoints: [
    'Insufficient data for deep analysis',
    'Community interest is accumulating',
    'Wait for more verified reviews'
  ]
})

const MOCK_REVIEWS = [
  {
    id: '1',
    targetAddress: '0x...',
    reviewerAddress: '0x74...fE23',
    rating: 5,
    content: 'Incredible platform. The speed is unmatched.',
    category: 'k/perp-dex',
    stakeAmount: '5000000000000000000',
    upvotes: 12,
    downvotes: 1,
    createdAt: '2025-01-28T10:30:00Z',
  },
  {
    id: '2',
    targetAddress: '0x...',
    reviewerAddress: '0x8b...2b27',
    rating: 4,
    content: 'Fees are a bit high during congestion but otherwise solid.',
    category: 'k/defi',
    stakeAmount: '10000000000000000000',
    upvotes: 8,
    downvotes: 2,
    createdAt: '2025-01-27T15:45:00Z',
  }
]

export default function ProjectPage() {
  const params = useParams()
  // ID from URL (e.g. 'hyperliquid')
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const projectId = id.toLowerCase()

  const data = PROJECT_DATA[projectId] || GENERIC_DATA(id)
  
  // Filter reviews to match category (just mocking here)
  const relevantReviews = MOCK_REVIEWS.map(r => ({ ...r, category: data.category }))

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Project Banner */}
      <div className="h-48 bg-gradient-to-r from-gray-900 to-black border-b border-[#1f1f23] relative">
        <div className="absolute bottom-0 left-0 w-full h-full bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#111113] border-4 border-[#0a0a0b] rounded-2xl flex items-center justify-center text-4xl shadow-2xl">
              {data.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-bold text-white">{data.name}</h1>
                <span className="px-3 py-1 bg-[#2a2a2e] text-gray-400 rounded-full text-xs font-medium border border-[#3f3f46]">
                  {data.category}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{data.category.startsWith('k/') ? `r/${data.category.split('/')[1]}` : data.category}</span>
                <span>•</span>
                <span>Tier 1 Project</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex gap-3">
             <Link 
              href="/review" 
              className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span>Write Review</span>
            </Link>
            <button className="bg-[#1a1a1d] hover:bg-[#2a2a2e] border border-[#2a2a2e] text-white px-6 py-2.5 rounded-lg font-medium transition">
              Join Community
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          
          {/* AI Analysis Section */}
          <AISummaryCard 
            projectName={data.name}
            verdict={data.aiVerdict}
            score={data.score}
            summary={data.summary}
            keyPoints={data.keyPoints}
          />

          {/* Discussion / Reviews */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Community Discussion</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg text-sm text-white">Top</button>
              <button className="px-3 py-1 text-gray-500 hover:text-white text-sm">New</button>
            </div>
          </div>

          <div className="space-y-4">
            {relevantReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block">
           <CommunityInfo category={data.category} />
           
           {/* Project Stats Widget */}
           <div className="w-80 mt-6 bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
              <h3 className="font-semibold mb-4 text-sm text-gray-400 uppercase">Market Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Price</span>
                  <span className="font-mono">$1.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">24h Vol</span>
                  <span className="font-mono">$420M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Market Cap</span>
                  <span className="font-mono">$1.2B</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  )
}
