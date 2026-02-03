/**
 * Mock Markets for Development and Fallback
 * DeFi and Crypto focused prediction markets
 */

export interface MockMarket {
  id: string
  question: string
  description: string
  slug: string
  category: string
  source: 'kindred'
  outcomes: {
    name: string
    price: number
  }[]
  volume: string
  liquidity: string
  endDate: string
  resolved: boolean
  createdAt: string
}

export const MOCK_MARKETS: MockMarket[] = [
  // Crypto Price Markets
  {
    id: 'btc-100k-2026',
    question: 'Will Bitcoin reach $100,000 by end of 2026?',
    description: 'Resolves YES if BTC/USD reaches or exceeds $100,000 on any major exchange (Coinbase, Binance, Kraken) before January 1, 2027 UTC.',
    slug: 'bitcoin-100k-2026',
    category: 'crypto',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.68 },
      { name: 'No', price: 0.32 },
    ],
    volume: '4500000',
    liquidity: '890000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'eth-10k-2026',
    question: 'Will Ethereum reach $10,000 by end of 2026?',
    description: 'Resolves YES if ETH/USD reaches or exceeds $10,000 on any major exchange before January 1, 2027 UTC.',
    slug: 'ethereum-10k-2026',
    category: 'crypto',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.42 },
      { name: 'No', price: 0.58 },
    ],
    volume: '2800000',
    liquidity: '620000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'sol-500-2026',
    question: 'Will Solana reach $500 by end of 2026?',
    description: 'Resolves YES if SOL/USD reaches or exceeds $500 before January 1, 2027 UTC.',
    slug: 'solana-500-2026',
    category: 'crypto',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.28 },
      { name: 'No', price: 0.72 },
    ],
    volume: '1200000',
    liquidity: '340000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-02-01T00:00:00Z',
  },

  // DeFi Protocol Markets
  {
    id: 'uniswap-v4-q1-2026',
    question: 'Will Uniswap v4 launch on mainnet by March 31, 2026?',
    description: 'Resolves YES if Uniswap v4 is deployed to Ethereum mainnet with hooks functionality enabled before April 1, 2026 UTC.',
    slug: 'uniswap-v4-q1-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.75 },
      { name: 'No', price: 0.25 },
    ],
    volume: '890000',
    liquidity: '210000',
    endDate: '2026-03-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'aave-10b-tvl',
    question: 'Will Aave reach $10B TVL in 2026?',
    description: 'Resolves YES if Aave (all chains combined) reaches $10 billion Total Value Locked according to DefiLlama at any point in 2026.',
    slug: 'aave-10b-tvl-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.55 },
      { name: 'No', price: 0.45 },
    ],
    volume: '560000',
    liquidity: '145000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-11-15T00:00:00Z',
  },
  {
    id: 'curve-crv-5',
    question: 'Will CRV token reach $5 by end of 2026?',
    description: 'Resolves YES if CRV/USD reaches or exceeds $5.00 on major exchanges before January 1, 2027.',
    slug: 'curve-crv-5-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.22 },
      { name: 'No', price: 0.78 },
    ],
    volume: '340000',
    liquidity: '78000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-10-01T00:00:00Z',
  },

  // Layer 2 Markets
  {
    id: 'base-top-l2',
    question: 'Will Base become the #1 L2 by TVL in 2026?',
    description: 'Resolves YES if Base has the highest TVL among all Ethereum L2s according to L2Beat at any point in 2026.',
    slug: 'base-top-l2-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.38 },
      { name: 'No', price: 0.62 },
    ],
    volume: '720000',
    liquidity: '180000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'arbitrum-arb-3',
    question: 'Will ARB token reach $3 in 2026?',
    description: 'Resolves YES if ARB/USD reaches or exceeds $3.00 before January 1, 2027.',
    slug: 'arbitrum-arb-3-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.31 },
      { name: 'No', price: 0.69 },
    ],
    volume: '480000',
    liquidity: '125000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-08-15T00:00:00Z',
  },

  // Perp DEX Markets
  {
    id: 'hyperliquid-top-perp',
    question: 'Will Hyperliquid be the #1 perp DEX by volume in Q2 2026?',
    description: 'Resolves YES if Hyperliquid has the highest 30-day trading volume among decentralized perpetual exchanges at the end of Q2 2026.',
    slug: 'hyperliquid-top-perp-q2-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.62 },
      { name: 'No', price: 0.38 },
    ],
    volume: '1100000',
    liquidity: '290000',
    endDate: '2026-06-30T23:59:59Z',
    resolved: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'gmx-500m-fees',
    question: 'Will GMX generate $500M in fees in 2026?',
    description: 'Resolves YES if GMX (v1 + v2) generates cumulative fees of $500M or more during calendar year 2026.',
    slug: 'gmx-500m-fees-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.45 },
      { name: 'No', price: 0.55 },
    ],
    volume: '380000',
    liquidity: '95000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2026-01-15T00:00:00Z',
  },

  // Stablecoin Markets
  {
    id: 'usdc-depeg-2026',
    question: 'Will USDC depeg below $0.99 for 24+ hours in 2026?',
    description: 'Resolves YES if USDC trades below $0.99 on major exchanges for 24 consecutive hours at any point in 2026.',
    slug: 'usdc-depeg-2026',
    category: 'defi',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.12 },
      { name: 'No', price: 0.88 },
    ],
    volume: '650000',
    liquidity: '210000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-12-15T00:00:00Z',
  },

  // Ethereum Markets
  {
    id: 'eth-etf-inflows-50b',
    question: 'Will ETH ETFs reach $50B cumulative inflows by end of 2026?',
    description: 'Resolves YES if total cumulative net inflows into all spot Ethereum ETFs reach $50 billion before January 1, 2027.',
    slug: 'eth-etf-inflows-50b-2026',
    category: 'crypto',
    source: 'kindred',
    outcomes: [
      { name: 'Yes', price: 0.35 },
      { name: 'No', price: 0.65 },
    ],
    volume: '920000',
    liquidity: '245000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    createdAt: '2025-07-01T00:00:00Z',
  },
]

/**
 * Get all mock markets
 */
export function getAllMockMarkets(): MockMarket[] {
  return MOCK_MARKETS
}

/**
 * Get mock markets by category
 */
export function getMockMarketsByCategory(category: string): MockMarket[] {
  return MOCK_MARKETS.filter(m => 
    m.category.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Get a single mock market by ID
 */
export function getMockMarketById(id: string): MockMarket | undefined {
  return MOCK_MARKETS.find(m => m.id === id || m.slug === id)
}

/**
 * Search mock markets
 */
export function searchMockMarkets(query: string): MockMarket[] {
  const q = query.toLowerCase()
  return MOCK_MARKETS.filter(m =>
    m.question.toLowerCase().includes(q) ||
    m.description.toLowerCase().includes(q) ||
    m.slug.toLowerCase().includes(q)
  )
}

export default MOCK_MARKETS
