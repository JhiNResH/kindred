'use server'

// CoinGecko API - Free tier, no API key needed
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

// Map common project names to CoinGecko IDs
const PROJECT_TO_COINGECKO: Record<string, string> = {
  'uniswap': 'uniswap',
  'uniswap v4': 'uniswap',
  'aave': 'aave',
  'aave v3': 'aave',
  'gmx': 'gmx',
  'hyperliquid': 'hyperliquid',
  'pendle': 'pendle',
  'compound': 'compound-governance-token',
  'curve': 'curve-dao-token',
  'lido': 'lido-dao',
  'maker': 'maker',
  'sushi': 'sushi',
  'chainlink': 'chainlink',
  'ethereum': 'ethereum',
  'bitcoin': 'bitcoin',
  'solana': 'solana',
  'eigenlayer': 'eigenlayer',
  'eigen': 'eigenlayer',
  'arbitrum': 'arbitrum',
  'optimism': 'optimism',
  'base': 'base-protocol',
  'jupiter': 'jupiter-exchange-solana',
  'raydium': 'raydium',
  'orca': 'orca',
  'marinade': 'marinade',
  'jito': 'jito-governance-token',
}

export interface TokenPrice {
  price: string
  priceChange24h: string
  volume24h: string
  marketCap: string
  image?: string
}

// Dynamic search for coin ID if not in mapping
async function findCoinId(projectName: string): Promise<string | null> {
  const normalizedName = projectName.toLowerCase().trim()
  
  // Check hardcoded mapping first
  if (PROJECT_TO_COINGECKO[normalizedName]) {
    return PROJECT_TO_COINGECKO[normalizedName]
  }
  
  // Dynamic search via CoinGecko API
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/search?query=${encodeURIComponent(projectName)}`,
      { next: { revalidate: 3600 } } // Cache search for 1 hour
    )
    
    if (!res.ok) return null
    
    const data = await res.json()
    const coin = data.coins?.[0]
    
    if (coin?.id) {
      console.log(`[CoinGecko] Found ${projectName} -> ${coin.id}`)
      return coin.id
    }
    
    return null
  } catch (error) {
    console.error('[CoinGecko] Search error:', error)
    return null
  }
}

export async function getTokenPrice(projectName: string): Promise<TokenPrice | null> {
  try {
    const coinId = await findCoinId(projectName)
    
    if (!coinId) {
      console.log(`[CoinGecko] Could not find: ${projectName}`)
      return null
    }

    const res = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!res.ok) {
      console.error(`[CoinGecko] API error: ${res.status}`)
      return null
    }

    const data = await res.json()
    
    const formatNumber = (num: number): string => {
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
      if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
      return `$${num.toFixed(2)}`
    }

    return {
      price: `$${data.market_data.current_price.usd.toFixed(2)}`,
      priceChange24h: `${data.market_data.price_change_percentage_24h?.toFixed(2) || 0}%`,
      volume24h: formatNumber(data.market_data.total_volume.usd),
      marketCap: formatNumber(data.market_data.market_cap.usd),
      image: data.image?.small,
    }
  } catch (error) {
    console.error('[CoinGecko] Error fetching price:', error)
    return null
  }
}

// Batch fetch for leaderboard
export async function getMultipleTokenPrices(projectNames: string[]): Promise<Record<string, TokenPrice>> {
  const results: Record<string, TokenPrice> = {}
  
  // Map project names to CoinGecko IDs
  const coinIds = projectNames
    .map(name => PROJECT_TO_COINGECKO[name.toLowerCase().trim()])
    .filter(Boolean)
  
  if (coinIds.length === 0) return results
  
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`,
      { next: { revalidate: 300 } }
    )
    
    if (!res.ok) return results
    
    const data = await res.json()
    
    const formatNumber = (num: number): string => {
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
      if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
      return `$${num.toFixed(2)}`
    }
    
    // Map back to project names
    for (const [projectName, coinId] of Object.entries(PROJECT_TO_COINGECKO)) {
      if (data[coinId]) {
        const coinData = data[coinId]
        results[projectName] = {
          price: `$${coinData.usd.toFixed(2)}`,
          priceChange24h: `${coinData.usd_24h_change?.toFixed(2) || 0}%`,
          volume24h: formatNumber(coinData.usd_24h_vol),
          marketCap: formatNumber(coinData.usd_market_cap),
        }
      }
    }
    
    return results
  } catch (error) {
    console.error('[CoinGecko] Batch error:', error)
    return results
  }
}
