import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/stats - Platform statistics for dashboard
export async function GET() {
  // Mock stats (replace with DB aggregation later)
  const stats = {
    totalReviews: 1247,
    totalStaked: '847.5K OPEN',
    activeUsers: 423,
    projectsRated: 89,
    avgRating: 4.2,
    winRate: 67.3,
    status: 'ok',
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(stats)
}
