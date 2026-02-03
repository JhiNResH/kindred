import { NextRequest, NextResponse } from 'next/server'
import { getTrendingMarkets } from '@/lib/polymarket'

export const dynamic = 'force-dynamic'

// GET /api/markets/trending - Get top markets by volume
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const markets = await getTrendingMarkets(limit)

    return NextResponse.json({
      markets,
      total: markets.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch trending markets:', error)
    return NextResponse.json({
      markets: [],
      total: 0,
      error: 'Failed to fetch trending markets',
    })
  }
}
