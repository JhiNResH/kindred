import { NextRequest, NextResponse } from 'next/server'

// Types
interface LeaderboardEntry {
  rank: number
  projectAddress: string
  projectName: string
  category: 'k/defi' | 'k/memecoin' | 'k/perp-dex' | 'k/ai'
  avgRating: number
  reviewCount: number
  totalStaked: string
  weeklyChange: number // rank change from last week
  predictedRank: number | null // stake-weighted prediction
}

// In-memory leaderboard (replace with calculated from reviews + stakes)
const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    projectAddress: '0x1234567890abcdef1234567890abcdef12345678',
    projectName: 'Hyperliquid',
    category: 'k/perp-dex',
    avgRating: 4.8,
    reviewCount: 156,
    totalStaked: '500000000000000000000', // 500 tokens
    weeklyChange: 0,
    predictedRank: 1,
  },
  {
    rank: 2,
    projectAddress: '0xdeadbeef1234567890abcdef1234567890abcdef',
    projectName: 'Aave',
    category: 'k/defi',
    avgRating: 4.6,
    reviewCount: 243,
    totalStaked: '450000000000000000000',
    weeklyChange: 1,
    predictedRank: 2,
  },
  {
    rank: 3,
    projectAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    projectName: 'GMX',
    category: 'k/perp-dex',
    avgRating: 4.5,
    reviewCount: 189,
    totalStaked: '380000000000000000000',
    weeklyChange: -1,
    predictedRank: 4,
  },
  {
    rank: 4,
    projectAddress: '0x9999888877776666555544443333222211110000',
    projectName: 'Uniswap',
    category: 'k/defi',
    avgRating: 4.7,
    reviewCount: 312,
    totalStaked: '320000000000000000000',
    weeklyChange: 2,
    predictedRank: 3,
  },
  {
    rank: 5,
    projectAddress: '0x5555666677778888999900001111222233334444',
    projectName: 'PEPE',
    category: 'k/memecoin',
    avgRating: 3.2,
    reviewCount: 89,
    totalStaked: '150000000000000000000',
    weeklyChange: 5,
    predictedRank: 8,
  },
]

// GET /api/leaderboard
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  let filtered = [...leaderboard]

  if (category && category !== 'all') {
    filtered = filtered.filter(e => e.category === category)
    // Re-rank within category
    filtered = filtered.map((e, i) => ({ ...e, rank: i + 1 }))
  }

  const paginated = filtered.slice(offset, offset + limit)

  return NextResponse.json({
    leaderboard: paginated,
    total: filtered.length,
    categories: ['k/defi', 'k/memecoin', 'k/perp-dex', 'k/ai'],
    lastUpdated: new Date().toISOString(),
    nextSettlement: getNextSunday().toISOString(), // Weekly settlement
  })
}

// Helper: Get next Sunday midnight UTC
function getNextSunday(): Date {
  const now = new Date()
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + daysUntilSunday)
  nextSunday.setHours(0, 0, 0, 0)
  return nextSunday
}
