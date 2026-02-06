import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'

// Types
interface LeaderboardEntry {
  rank: number
  projectAddress: string
  projectName: string
  category: string
  image: string | null
  avgRating: number
  reviewCount: number
  totalStaked: string
  weeklyChange: number // rank change from last week (TODO: implement)
  predictedRank: number | null // stake-weighted prediction (TODO: calculate)
  bullishCount: number
  bearishCount: number
  mindshareScore: number
}

// GET /api/leaderboard
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const where = category && category !== 'all' ? { category } : {}

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { currentRank: 'asc' },
        { avgRating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
      skip: offset,
    })

    const leaderboard: LeaderboardEntry[] = projects.map((p, idx) => ({
      rank: offset + idx + 1,
      projectAddress: p.address,
      projectName: p.name,
      category: p.category,
      image: p.image,
      avgRating: p.avgRating,
      reviewCount: p.reviewCount,
      totalStaked: p.totalStaked,
      weeklyChange: 0, // TODO: Track weekly rank changes in SettlementRound
      predictedRank: p.currentRank,
      bullishCount: p.bullishCount,
      bearishCount: p.bearishCount,
      mindshareScore: p.mindshareScore,
    }))

    const total = await prisma.project.count({ where })

    return NextResponse.json({
      leaderboard,
      total,
      categories: ['k/defi', 'k/perp-dex', 'k/restaurants', 'k/ai'],
      lastUpdated: new Date().toISOString(),
      nextSettlement: getNextSunday().toISOString(), // Weekly settlement
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
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
