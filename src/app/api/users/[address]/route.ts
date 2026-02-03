import { NextRequest, NextResponse } from 'next/server'

// Types
interface UserReputation {
  address: string
  displayName: string | null
  totalReviews: number
  totalUpvotes: number
  totalStaked: string
  totalWon: string
  totalLost: string
  winRate: number
  reputationScore: number
  level: 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'authority'
  badges: string[]
  joinedAt: string
}

// Calculate level from score
function calculateLevel(score: number): UserReputation['level'] {
  if (score >= 10000) return 'authority'
  if (score >= 5000) return 'expert'
  if (score >= 1000) return 'trusted'
  if (score >= 100) return 'contributor'
  return 'newcomer'
}

// Calculate badges
function calculateBadges(user: Partial<UserReputation>): string[] {
  const badges: string[] = []
  
  if ((user.totalReviews || 0) >= 100) badges.push('Century Reviewer')
  if ((user.totalReviews || 0) >= 10) badges.push('Active Reviewer')
  if ((user.winRate || 0) >= 80) badges.push('Oracle')
  if ((user.winRate || 0) >= 60) badges.push('Predictor')
  if (BigInt(user.totalStaked || '0') >= BigInt('100000000000000000000')) badges.push('High Roller')
  if ((user.totalUpvotes || 0) >= 1000) badges.push('Influencer')
  
  return badges
}

// Mock user data (replace with DB lookup)
const users: Map<string, UserReputation> = new Map([
  ['0xabcdef1234567890abcdef1234567890abcdef12', {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    displayName: 'DeFiChad.eth',
    totalReviews: 45,
    totalUpvotes: 320,
    totalStaked: '50000000000000000000',
    totalWon: '35000000000000000000',
    totalLost: '15000000000000000000',
    winRate: 70,
    reputationScore: 2450,
    level: 'trusted',
    badges: ['Active Reviewer', 'Predictor'],
    joinedAt: '2024-06-15T00:00:00Z',
  }],
])

// GET /api/users/[address]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params
  
  // Validate address
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 })
  }

  const normalizedAddress = address.toLowerCase()
  
  // Check if user exists
  let user = users.get(normalizedAddress)
  
  if (!user) {
    // Return default user for new addresses
    user = {
      address: normalizedAddress,
      displayName: null,
      totalReviews: 0,
      totalUpvotes: 0,
      totalStaked: '0',
      totalWon: '0',
      totalLost: '0',
      winRate: 0,
      reputationScore: 0,
      level: 'newcomer',
      badges: [],
      joinedAt: new Date().toISOString(),
    }
  }

  // Recalculate derived fields
  user.level = calculateLevel(user.reputationScore)
  user.badges = calculateBadges(user)

  return NextResponse.json(user)
}
