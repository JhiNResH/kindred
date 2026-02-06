import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/vote - Cast a sentiment vote on a project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, sentiment, voterAddress } = body

    // Validate input
    if (!projectId || !sentiment) {
      return NextResponse.json(
        { error: 'projectId and sentiment required' },
        { status: 400 }
      )
    }

    if (!['bullish', 'bearish'].includes(sentiment)) {
      return NextResponse.json(
        { error: 'sentiment must be "bullish" or "bearish"' },
        { status: 400 }
      )
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      // Try finding by address
      const projectByAddress = await prisma.project.findUnique({
        where: { address: projectId }
      })
      if (!projectByAddress) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
    }

    const targetProjectId = project?.id || projectId

    // Upsert vote (one vote per address per project)
    const vote = await prisma.projectVote.upsert({
      where: {
        voterAddress_projectId: {
          voterAddress: voterAddress || 'anonymous',
          projectId: targetProjectId,
        }
      },
      update: {
        sentiment,
      },
      create: {
        projectId: targetProjectId,
        sentiment,
        voterAddress: voterAddress || 'anonymous',
      }
    })

    // Update project vote counts
    const voteCounts = await prisma.projectVote.groupBy({
      by: ['sentiment'],
      where: { projectId: targetProjectId },
      _count: { id: true }
    })

    const bullishCount = voteCounts.find(v => v.sentiment === 'bullish')?._count.id || 0
    const bearishCount = voteCounts.find(v => v.sentiment === 'bearish')?._count.id || 0

    // Calculate mindshare: reviewCount*2 + bullishCount + totalStaked(normalized)
    const updatedProject = await prisma.project.update({
      where: { id: targetProjectId },
      data: {
        bullishCount,
        bearishCount,
        mindshareScore: (project?.reviewCount || 0) * 2 + bullishCount + 
          (parseInt(project?.totalStaked || '0') / 1e18) // normalize stake
      }
    })

    return NextResponse.json({
      success: true,
      vote: {
        id: vote.id,
        sentiment: vote.sentiment,
        projectId: vote.projectId,
      },
      projectStats: {
        bullishCount,
        bearishCount,
        totalVotes: bullishCount + bearishCount,
        bullishPercent: bullishCount + bearishCount > 0 
          ? Math.round((bullishCount / (bullishCount + bearishCount)) * 100)
          : 50,
        mindshareScore: updatedProject.mindshareScore,
      }
    })
  } catch (error) {
    console.error('[API] /api/vote error:', error)
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    )
  }
}

// GET /api/vote?projectId=xxx - Get vote stats for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const voterAddress = searchParams.get('voterAddress')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId required' },
        { status: 400 }
      )
    }

    // Get project stats
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: projectId },
          { address: projectId }
        ]
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get user's vote if address provided
    let userVote = null
    if (voterAddress) {
      userVote = await prisma.projectVote.findUnique({
        where: {
          voterAddress_projectId: {
            voterAddress,
            projectId: project.id,
          }
        }
      })
    }

    const totalVotes = project.bullishCount + project.bearishCount

    return NextResponse.json({
      projectId: project.id,
      bullishCount: project.bullishCount,
      bearishCount: project.bearishCount,
      totalVotes,
      bullishPercent: totalVotes > 0 
        ? Math.round((project.bullishCount / totalVotes) * 100)
        : 50,
      mindshareScore: project.mindshareScore,
      userVote: userVote?.sentiment || null,
    })
  } catch (error) {
    console.error('[API] /api/vote GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get vote stats' },
      { status: 500 }
    )
  }
}
