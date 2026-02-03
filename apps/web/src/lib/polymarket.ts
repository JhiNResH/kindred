/**
 * Polymarket API Integration
 * Fetches real-time prediction market data
 */

const POLYMARKET_API = {
  GAMMA: 'https://gamma-api.polymarket.com',
  CLOB: 'https://clob.polymarket.com',
}

export interface PolymarketMarket {
  id: string
  conditionId: string
  question: string
  description?: string
  slug: string
  outcomes: string[]
  outcomePrices: string[]
  volume: number
  liquidity: number
  endDate: string | null
  resolved: boolean
  tags: string[]
  createdAt: string
}

export interface TransformedMarket {
  id: string
  question: string
  description?: string
  slug: string
  category: string
  source: 'polymarket'
  outcomes: {
    name: string
    price: number
    token?: string
  }[]
  volume: string
  liquidity: string
  endDate: string | null
  resolved: boolean
  createdAt: string
  polymarketUrl: string
}

/**
 * Fetch active markets from Polymarket
 */
export async function fetchMarkets(options: {
  limit?: number
  offset?: number
  tag?: string
  active?: boolean
} = {}): Promise<TransformedMarket[]> {
  const { limit = 50, offset = 0, tag, active = true } = options

  try {
    const url = new URL(`${POLYMARKET_API.GAMMA}/markets`)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('offset', offset.toString())
    url.searchParams.set('active', active.toString())
    url.searchParams.set('closed', 'false')
    
    if (tag) {
      url.searchParams.set('tag', tag)
    }

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.error(`Polymarket API error: ${response.status}`)
      return []
    }

    const markets: PolymarketMarket[] = await response.json()
    return markets.map(transformMarket)
  } catch (error) {
    console.error('Failed to fetch Polymarket markets:', error)
    return []
  }
}

/**
 * Fetch a single market by ID or slug
 */
export async function fetchMarket(idOrSlug: string): Promise<TransformedMarket | null> {
  try {
    // Try by condition ID first
    let response = await fetch(`${POLYMARKET_API.GAMMA}/markets/${idOrSlug}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      // Try by slug
      response = await fetch(`${POLYMARKET_API.GAMMA}/markets?slug=${idOrSlug}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 30 },
      })
      
      if (response.ok) {
        const markets = await response.json()
        if (markets.length > 0) {
          return transformMarket(markets[0])
        }
      }
      return null
    }

    const market: PolymarketMarket = await response.json()
    return transformMarket(market)
  } catch (error) {
    console.error('Failed to fetch market:', error)
    return null
  }
}

/**
 * Search markets by query
 */
export async function searchMarkets(query: string, limit = 20): Promise<TransformedMarket[]> {
  try {
    const url = new URL(`${POLYMARKET_API.GAMMA}/markets`)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('active', 'true')
    // Note: Polymarket doesn't have a direct search param, so we fetch and filter
    
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    })

    if (!response.ok) return []

    const markets: PolymarketMarket[] = await response.json()
    const queryLower = query.toLowerCase()
    
    return markets
      .filter(m => 
        m.question.toLowerCase().includes(queryLower) ||
        m.slug.toLowerCase().includes(queryLower) ||
        m.tags?.some(t => t.toLowerCase().includes(queryLower))
      )
      .map(transformMarket)
  } catch (error) {
    console.error('Failed to search markets:', error)
    return []
  }
}

/**
 * Get trending/hot markets (by volume)
 */
export async function getTrendingMarkets(limit = 10): Promise<TransformedMarket[]> {
  const markets = await fetchMarkets({ limit: 100, active: true })
  
  // Sort by volume and return top N
  return markets
    .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
    .slice(0, limit)
}

/**
 * Get markets by category
 */
export async function getMarketsByCategory(category: string, limit = 20): Promise<TransformedMarket[]> {
  // Map our categories to Polymarket tags
  const tagMap: Record<string, string> = {
    'crypto': 'crypto',
    'defi': 'defi',
    'politics': 'politics',
    'sports': 'sports',
    'ai': 'ai',
    'elections': 'elections',
  }

  const tag = tagMap[category.toLowerCase()]
  if (!tag) {
    // Fetch all and filter
    const markets = await fetchMarkets({ limit: 100 })
    return markets.filter(m => 
      m.category.toLowerCase() === category.toLowerCase()
    ).slice(0, limit)
  }

  return fetchMarkets({ limit, tag })
}

/**
 * Transform Polymarket market to our format
 */
function transformMarket(m: PolymarketMarket): TransformedMarket {
  return {
    id: m.conditionId || m.id || m.slug,
    question: m.question,
    description: m.description,
    slug: m.slug,
    category: categorizeMarket(m),
    source: 'polymarket',
    outcomes: (m.outcomes || ['Yes', 'No']).map((name, i) => ({
      name,
      price: m.outcomePrices?.[i] ? parseFloat(m.outcomePrices[i]) : 0.5,
    })),
    volume: (m.volume || 0).toString(),
    liquidity: (m.liquidity || 0).toString(),
    endDate: m.endDate || null,
    resolved: m.resolved || false,
    createdAt: m.createdAt || new Date().toISOString(),
    polymarketUrl: `https://polymarket.com/event/${m.slug}`,
  }
}

/**
 * Categorize market based on tags and question
 */
function categorizeMarket(m: PolymarketMarket): string {
  const tags = m.tags || []
  const question = (m.question || '').toLowerCase()

  // Check tags first
  if (tags.some(t => ['crypto', 'bitcoin', 'ethereum', 'defi'].includes(t.toLowerCase()))) {
    return 'crypto'
  }
  if (tags.some(t => ['politics', 'election', 'government'].includes(t.toLowerCase()))) {
    return 'politics'
  }
  if (tags.some(t => ['sports', 'nba', 'nfl', 'soccer'].includes(t.toLowerCase()))) {
    return 'sports'
  }
  if (tags.some(t => ['ai', 'technology', 'tech'].includes(t.toLowerCase()))) {
    return 'tech'
  }

  // Check question content
  if (question.includes('bitcoin') || question.includes('ethereum') || question.includes('crypto')) {
    return 'crypto'
  }
  if (question.includes('election') || question.includes('president') || question.includes('congress')) {
    return 'politics'
  }
  if (question.includes('championship') || question.includes('win the') || question.includes('super bowl')) {
    return 'sports'
  }

  return tags[0]?.toLowerCase() || 'other'
}

export default {
  fetchMarkets,
  fetchMarket,
  searchMarkets,
  getTrendingMarkets,
  getMarketsByCategory,
}
