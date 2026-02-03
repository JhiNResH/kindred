// ===========================================
// Kindred Shared Types
// Used by both API and Frontend
// ===========================================

// Categories
export type CategoryId = 'k/defi' | 'k/memecoin' | 'k/perp-dex' | 'k/ai'

export interface Category {
  id: CategoryId
  name: string
  description: string
  icon: string
  projectCount: number
  reviewCount: number
  totalStaked: string // wei
  color: string // hex
}

// Reviews
export interface Review {
  id: string
  targetAddress: string
  targetName: string
  reviewerAddress: string
  rating: number // 1-5
  content: string
  category: CategoryId
  predictedRank: number | null
  stakeAmount: string // wei
  photoUrls: string[]
  upvotes: number
  downvotes: number
  createdAt: string // ISO
}

export interface CreateReviewInput {
  targetAddress: string
  targetName?: string
  rating: number
  content: string
  category: CategoryId
  predictedRank?: number
  stakeAmount?: string
  photoUrls?: string[]
}

// Users & Reputation
export type ReputationLevel = 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'authority'

export interface UserProfile {
  address: string
  displayName: string | null
  totalReviews: number
  totalUpvotes: number
  totalStaked: string
  totalWon: string
  totalLost: string
  winRate: number // 0-100
  reputationScore: number
  level: ReputationLevel
  badges: string[]
  joinedAt: string
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number
  projectAddress: string
  projectName: string
  category: CategoryId
  avgRating: number
  reviewCount: number
  totalStaked: string
  weeklyChange: number // rank change
  predictedRank: number | null
}

// Stakes
export type StakeStatus = 'active' | 'won' | 'lost' | 'pending'

export interface Stake {
  id: string
  stakerAddress: string
  reviewId: string | null
  projectAddress: string
  projectName: string
  predictedRank: number
  amount: string // wei
  status: StakeStatus
  createdAt: string
  settledAt: string | null
  payout: string | null
}

export interface CreateStakeInput {
  projectAddress: string
  projectName?: string
  predictedRank: number
  amount: string
  reviewId?: string
}

// Markets (Polymarket integration)
export interface Market {
  id: string
  question: string
  description: string
  outcomes: MarketOutcome[]
  volume: string
  liquidity: string
  endDate: string
  resolved: boolean
  source: 'polymarket' | 'kindred'
  category?: string
  imageUrl?: string
  polymarketUrl?: string
}

export interface MarketOutcome {
  id: string
  name: string
  price: number // 0-1
}

// Positions
export type PositionStatus = 'open' | 'closed' | 'settled'

export interface Position {
  id: string
  userAddress: string
  marketId: string
  marketQuestion: string
  outcome: 'yes' | 'no'
  shares: string
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  status: PositionStatus
  createdAt: string
  closedAt: string | null
}

// Platform Stats
export interface PlatformStats {
  totalReviews: number
  totalStaked: string
  totalStakedFormatted: string
  activeUsers: number
  projectsRated: number
  avgRating: number
  totalPayouts: string
  winRate: number
  lastUpdated: string
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T
  status: 'ok' | 'error'
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

// Sorting
export type ReviewSort = 'hot' | 'new' | 'top' | 'rising'
export type LeaderboardSort = 'rating' | 'reviews' | 'staked' | 'change'
