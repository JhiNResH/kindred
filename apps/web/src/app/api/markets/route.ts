import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Types
interface Market {
  id: string
  question: string
  slug: string
  category: string
  source: 'polymarket' | 'prediction-market'
  outcomes: Outcome[]
  volume: string
  liquidity: string
  endDate: string | null
  resolved: boolean
  createdAt: string
}

interface Outcome {
  id: string
  name: string
  price: number // 0-1 representing probability
  volume: string
}

// Polymarket CLOB API endpoints
const POLYMARKET_API = {
  GAMMA: 'https://gamma-api.polymarket.com',
  CLOB: 'https://clob.polymarket.com',
}

// Fetch markets from Polymarket
async function fetchPolymarketMarkets(category?: string, limit = 20): Promise<Market[]> {
  try {
    // Use Gamma API for market discovery
    const url = new URL(`${POLYMARKET_API.GAMMA}/markets`)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('active', 'true')
    url.searchParams.set('closed', 'false')
    
    if (category) {
      url.searchParams.set('tag', category)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      console.error('Polymarket API error:', response.status)
      return []
    }

    const data = await response.json()
    
    // Transform to our format
    return (data || []).map((m: any) => ({
      id: m.conditionId || m.id,
      question: m.question,
      slug: m.slug,
      category: m.tags?.[0] || 'other',
      source: 'polymarket' as const,
      outcomes: (m.outcomes || []).map((o: any, i: number) => ({
        id: `${m.id}-${i}`,
        name: o,
        price: m.outcomePrices?.[i] ? parseFloat(m.outcomePrices[i]) : 0.5,
        volume: '0',
      })),
      volume: m.volume?.toString() || '0',
      liquidity: m.liquidity?.toString() || '0',
      endDate: m.endDate || null,
      resolved: m.resolved || false,
      createdAt: m.createdAt || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Failed to fetch Polymarket markets:', error)
    return []
  }
}

// Mock markets for development/fallback
const MOCK_MARKETS: Market[] = [
  {
    id: 'mock-1',
    question: 'Will Bitcoin reach $100,000 by end of 2026?',
    slug: 'bitcoin-100k-2026',
    category: 'crypto',
    source: 'prediction-market',
    outcomes: [
      { id: 'mock-1-yes', name: 'Yes', price: 0.65, volume: '1500000' },
      { id: 'mock-1-no', name: 'No', price: 0.35, volume: '800000' },
    ],
    volume: '2300000',
    liquidity: '500000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mock-2',
    question: 'Will Ethereum flip Bitcoin market cap in 2026?',
    slug: 'eth-flip-btc-2026',
    category: 'crypto',
    source: 'prediction-market',
    outcomes: [
      { id: 'mock-2-yes', name: 'Yes', price: 0.15, volume: '500000' },
      { id: 'mock-2-no', name: 'No', price: 0.85, volume: '2800000' },
    ],
    volume: '3300000',
    liquidity: '800000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'mock-3',
    question: 'Will Uniswap v4 launch in Q1 2026?',
    slug: 'uniswap-v4-q1-2026',
    category: 'defi',
    source: 'prediction-market',
    outcomes: [
      { id: 'mock-3-yes', name: 'Yes', price: 0.72, volume: '200000' },
      { id: 'mock-3-no', name: 'No', price: 0.28, volume: '78000' },
    ],
    volume: '278000',
    liquidity: '50000',
    endDate: '2026-03-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-12-01T00:00:00Z',
  },
]

// GET /api/markets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('q')

  let markets: Market[] = []

  // Fetch from Polymarket if not filtering to mock only
  if (source !== 'mock') {
    const polymarketMarkets = await fetchPolymarketMarkets(category || undefined, limit)
    markets = [...markets, ...polymarketMarkets]
  }

  // Add mock markets if no real data or explicitly requested
  if (markets.length === 0 || source === 'mock' || source === 'all') {
    markets = [...markets, ...MOCK_MARKETS]
  }

  // Filter by category
  if (category) {
    markets = markets.filter(m => 
      m.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Search
  if (search) {
    const searchLower = search.toLowerCase()
    markets = markets.filter(m =>
      m.question.toLowerCase().includes(searchLower) ||
      m.slug.toLowerCase().includes(searchLower)
    )
  }

  // Sort by volume (highest first)
  markets.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))

  // Limit
  markets = markets.slice(0, limit)

  return NextResponse.json({
    markets,
    total: markets.length,
    categories: ['crypto', 'defi', 'politics', 'sports', 'other'],
    sources: ['polymarket', 'prediction-market'],
    lastUpdated: new Date().toISOString(),
  })
}

// GET /api/markets/[id] - Get single market details
export async function POST(request: NextRequest) {
  // This handles fetching a specific market by ID
  // Used for detailed view with order book, etc.
  try {
    const body = await request.json()
    const { marketId } = body

    if (!marketId) {
      return NextResponse.json({ error: 'marketId required' }, { status: 400 })
    }

    // Try to fetch from Polymarket
    try {
      const response = await fetch(
        `${POLYMARKET_API.GAMMA}/markets/${marketId}`,
        { next: { revalidate: 30 } }
      )

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          market: {
            id: data.conditionId || data.id,
            question: data.question,
            description: data.description,
            outcomes: data.outcomes,
            volume: data.volume,
            liquidity: data.liquidity,
            endDate: data.endDate,
          },
          source: 'polymarket',
        })
      }
    } catch (e) {
      // Fall through to mock
    }

    // Check mock markets
    const mockMarket = MOCK_MARKETS.find(m => m.id === marketId)
    if (mockMarket) {
      return NextResponse.json({
        market: mockMarket,
        source: 'mock',
      })
    }

    return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
