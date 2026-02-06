import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category required' }, { status: 400 })
    }

    // Get real stats from database
    const stats = await prisma.project.aggregate({
      where: { category },
      _count: { id: true },
      _sum: { reviewCount: true },
    })

    // Count unique reviewers as "members"
    const reviewerCount = await prisma.review.groupBy({
      by: ['reviewerId'],
      where: {
        project: { category }
      }
    })

    // Get total staked from projects in this category
    const projects = await prisma.project.findMany({
      where: { category },
      select: { totalStaked: true }
    })
    
    const totalStaked = projects.reduce((sum, p) => {
      const staked = BigInt(p.totalStaked || '0')
      return sum + staked
    }, BigInt(0))

    const stakedInEth = Number(totalStaked) / 1e18

    return NextResponse.json({
      members: reviewerCount.length > 0 ? `${reviewerCount.length}` : '-',
      staked: stakedInEth > 0 ? `$${(stakedInEth).toFixed(1)}K` : '-',
      projectCount: stats._count.id,
      reviewCount: stats._sum.reviewCount || 0,
      category,
    })
  } catch (error) {
    console.error('[API] /api/communities error:', error)
    return NextResponse.json({ members: '-', staked: '-' })
  }
}
