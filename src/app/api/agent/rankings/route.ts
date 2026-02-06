import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'

/**
 * GET /api/agent/rankings
 * 
 * Query Parameters:
 * - category: string (optional) - Filter by category (e.g., "defi", "perp-dex", "memecoin", "ai")
 * - limit: number (optional, default: 10) - Maximum number of results
 * 
 * Response:
 * {
 *   rankings: [
 *     {
 *       projectId: string,
 *       name: string,
 *       rank: number,
 *       avgRating: number,
 *       reviewCount: number,
 *       totalStaked: string,
 *       score: number // composite score for ranking
 *     }
 *   ]
 * }
 * 
 * Ranking Logic:
 * score = (avgRating * 0.4) + (reviewCount * 0.3) + (totalStakedNormalized * 0.3)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Build query filter
    const where: any = {}
    if (category) {
      where.category = category
    }

    // Fetch projects
    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        avgRating: true,
        reviewCount: true,
        totalStaked: true,
      },
    })

    // Calculate composite score and rank
    // Normalize totalStaked (convert string to number for ranking)
    const maxStaked = projects.reduce((max, p) => {
      const staked = parseFloat(p.totalStaked || '0')
      return Math.max(max, staked)
    }, 1)

    const scored = projects.map((project) => {
      const staked = parseFloat(project.totalStaked || '0')
      const stakedNormalized = maxStaked > 0 ? staked / maxStaked : 0

      // Composite score: 40% rating, 30% review count, 30% staked
      const score =
        project.avgRating * 0.4 +
        project.reviewCount * 0.3 +
        stakedNormalized * 10 * 0.3 // Scale staked to ~10 range

      return {
        ...project,
        score,
      }
    })

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)

    // Assign ranks and limit
    const rankings = scored.slice(0, limit).map((item, index) => ({
      projectId: item.id,
      name: item.name,
      rank: index + 1,
      avgRating: item.avgRating,
      reviewCount: item.reviewCount,
      totalStaked: item.totalStaked,
      score: parseFloat(item.score.toFixed(2)),
    }))

    return NextResponse.json({ rankings })
  } catch (error: any) {
    console.error('Error fetching rankings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings', details: error.message },
      { status: 500 }
    )
  }
}
