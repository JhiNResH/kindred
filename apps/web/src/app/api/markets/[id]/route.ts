import { NextRequest, NextResponse } from 'next/server'
import { fetchMarket } from '@/lib/polymarket'
import { getMockMarketById } from '@/lib/mock-markets'

export const dynamic = 'force-dynamic'

// GET /api/markets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Try Polymarket first
    const polymarketMarket = await fetchMarket(id)
    if (polymarketMarket) {
      return NextResponse.json({
        market: polymarketMarket,
        source: 'polymarket',
        actions: {
          trade: polymarketMarket.polymarketUrl,
          share: `https://kindred.xyz/markets/${id}`,
        },
      })
    }

    // Try Kindred mock markets
    const kindredMarket = getMockMarketById(id)
    if (kindredMarket) {
      return NextResponse.json({
        market: kindredMarket,
        source: 'kindred',
        actions: {
          trade: `/markets/${id}/trade`,
          share: `https://kindred.xyz/markets/${id}`,
        },
      })
    }

    return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  } catch (error) {
    console.error('Market fetch error:', error)
    
    // Fallback to mock on error
    const kindredMarket = getMockMarketById(id)
    if (kindredMarket) {
      return NextResponse.json({
        market: kindredMarket,
        source: 'kindred',
        note: 'Polymarket unavailable',
      })
    }

    return NextResponse.json({ error: 'Failed to fetch market' }, { status: 500 })
  }
}
