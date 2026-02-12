import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { agentContentGenerator, AgentId, AGENT_PROFILES } from '@/lib/agent-content-generator'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/agent-content/generate
 * 
 * Generate agent reviews for projects
 * 
 * Body:
 * - agentId?: string - Specific agent ID (or all if not provided)
 * - projectId?: string - Specific project ID (or auto-select if not provided)
 * - count?: number - Number of reviews to generate (default: 1)
 * - strategy?: 'random' | 'least-reviewed' - Project selection strategy (default: 'least-reviewed')
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      agentId,
      projectId,
      count = 1,
      strategy = 'least-reviewed',
    } = body

    // Validate agentId if provided
    if (agentId && !AGENT_PROFILES[agentId as AgentId]) {
      return NextResponse.json(
        { error: `Invalid agentId. Must be one of: ${Object.keys(AGENT_PROFILES).join(', ')}` },
        { status: 400 }
      )
    }

    // Determine which agents to use
    const agentIds: AgentId[] = agentId 
      ? [agentId as AgentId]
      : Object.keys(AGENT_PROFILES) as AgentId[]

    // Select projects
    let projects: Array<{ id: string; name: string; category: string; description?: string }>

    if (projectId) {
      // Specific project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true, category: true, description: true },
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      projects = [project]
    } else {
      // Auto-select projects based on strategy
      projects = await this.selectProjects(strategy, count)
    }

    if (projects.length === 0) {
      return NextResponse.json({ error: 'No projects available for review' }, { status: 404 })
    }

    // Generate reviews
    const generatedReviews = await agentContentGenerator.generateBulkReviews(
      projects,
      agentIds,
      agentId ? 1 : Math.ceil(count / projects.length) // Reviews per project
    )

    // Find or create agents in DB
    const agentRecords = await Promise.all(
      agentIds.map(async (aid) => {
        const profile = AGENT_PROFILES[aid]
        let agent = await prisma.agent.findUnique({
          where: { wallet: profile.wallet },
        })

        if (!agent) {
          // Create agent if doesn't exist
          agent = await prisma.agent.create({
            data: {
              id: profile.id,
              name: profile.name,
              wallet: profile.wallet,
              chain: 'base',
              description: profile.persona,
              apiKey: `agent-${profile.id}-${Date.now()}`, // Placeholder
              signature: 'auto-generated',
              message: 'System agent',
              claimCode: `claim-${profile.id}`,
            },
          })
        }

        return agent
      })
    )

    // Save reviews to database
    const savedReviews = await Promise.all(
      generatedReviews.map(async (review) => {
        const agent = agentRecords.find(a => a.wallet === review.authorAddress)
        if (!agent) {
          console.error(`Agent not found for wallet ${review.authorAddress}`)
          return null
        }

        return prisma.review.create({
          data: {
            content: review.content,
            rating: review.rating,
            agentId: agent.id,
            projectId: review.projectId,
            stakeAmount: '1', // Default 1 DRONE stake
            status: 'active',
          },
          include: {
            agent: { select: { id: true, name: true, wallet: true } },
            project: { select: { id: true, name: true, category: true } },
          },
        })
      })
    )

    const successfulReviews = savedReviews.filter(r => r !== null)

    return NextResponse.json({
      success: true,
      generated: successfulReviews.length,
      reviews: successfulReviews.map(r => ({
        id: r!.id,
        projectId: r!.projectId,
        projectName: r!.project.name,
        agentId: r!.agent!.id,
        agentName: r!.agent!.name,
        rating: r!.rating,
        content: r!.content.substring(0, 100) + '...',
        createdAt: r!.createdAt.toISOString(),
      })),
    }, { status: 201 })
  } catch (error) {
    console.error('Error generating agent content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Select projects based on strategy
 */
async function selectProjects(
  strategy: 'random' | 'least-reviewed',
  count: number
): Promise<Array<{ id: string; name: string; category: string; description?: string }>> {
  if (strategy === 'least-reviewed') {
    // Find projects with fewest reviews (prioritize 0 reviews)
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        reviewCount: true,
      },
      orderBy: [
        { reviewCount: 'asc' },
        { createdAt: 'desc' },
      ],
      take: count,
    })

    return projects.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description || undefined,
    }))
  } else {
    // Random selection
    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
    })

    // Shuffle and take count
    const shuffled = allProjects.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}
