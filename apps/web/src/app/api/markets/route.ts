import { NextRequest, NextResponse } from 'next/server'
import { fetchMarkets, searchMarkets, getMarketsByCategory } from '@/lib/polymarket'
import { getAllMockMarkets, getMockMarketsByCategory, searchMockMarkets } from '@/lib/mock-markets'

export const dynamic = 'force-dynamic'

// GET /api/markets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const source = searchParams.get('source') // polymarket, kindred, all
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const search = searchParams.get('q')

  let allMarkets: any[] = []

  try {
    // Fetch from Polymarket (unless source=kindred)
    if (source !== 'kindred') {
      let polymarketMarkets: any[] = []
      
      if (search) {
        polymarketMarkets = await searchMarkets(search, limit)
      } else if (category && category !== 'all') {
        polymarketMarkets = await getMarketsByCategory(category, limit)
      } else {
        polymarketMarkets = await fetchMarkets({ limit, offset })
      }
      
      allMarkets = [...allMarkets, ...polymarketMarkets]
    }

    // Add mock/Kindred markets (unless source=polymarket)
    if (source !== 'polymarket') {
      let kindredMarkets: any[]
      
      if (search) {
        kindredMarkets = searchMockMarkets(search)
      } else if (category && category !== 'all') {
        kindredMarkets = getMockMarketsByCategory(category)
      } else {
        kindredMarkets = getAllMockMarkets()
      }
      
      allMarkets = [...allMarkets, ...kindredMarkets]
    }

    // Remove duplicates (by slug or id)
    const seen = new Set()
    allMarkets = allMarkets.filter(m => {
      const key = m.slug || m.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort by volume (highest first)
    allMarkets.sort((a, b) => {
      const volA = parseFloat(a.volume || '0')
      const volB = parseFloat(b.volume || '0')
      return volB - volA
    })

    // Apply limit
    const paginatedMarkets = allMarkets.slice(0, limit)

    return NextResponse.json({
      markets: paginatedMarkets,
      total: allMarkets.length,
      returned: paginatedMarkets.length,
      categories: ['crypto', 'defi', 'politics', 'sports', 'tech', 'other'],
      sources: ['polymarket', 'kindred'],
      filters: { category, source, search, limit, offset },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Markets API error:', error)
    
    // Fallback to mock markets on error
    const fallbackMarkets = category 
      ? getMockMarketsByCategory(category)
      : getAllMockMarkets()

    return NextResponse.json({
      markets: fallbackMarkets.slice(0, limit),
      total: fallbackMarkets.length,
      returned: Math.min(fallbackMarkets.length, limit),
      categories: ['crypto', 'defi', 'politics', 'sports', 'tech', 'other'],
      sources: ['kindred'],
      error: 'Polymarket API unavailable, showing Kindred markets only',
      lastUpdated: new Date().toISOString(),
    })
  }
}

// POST /api/markets - Search or get market by ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marketId, search } = body

    if (search) {
      // Search mode
      const polymarketResults = await searchMarkets(search, 10)
      const kindredResults = searchMockMarkets(search)
      
      return NextResponse.json({
        results: [...polymarketResults, ...kindredResults].slice(0, 20),
        query: search,
      })
    }

    if (marketId) {
      // Single market lookup
      const { fetchMarket } = await import('@/lib/polymarket')
      const { getMockMarketById } = await import('@/lib/mock-markets')
      
      // Try Polymarket first
      const polymarket = await fetchMarket(marketId)
      if (polymarket) {
        return NextResponse.json({ market: polymarket, source: 'polymarket' })
      }

      // Try mock markets
      const mockMarket = getMockMarketById(marketId)
      if (mockMarket) {
        return NextResponse.json({ market: mockMarket, source: 'kindred' })
      }

      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'marketId or search required' }, { status: 400 })
  } catch (error) {
    console.error('Markets POST error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
