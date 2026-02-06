import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeProject } from '@/app/actions/analyze'

export const dynamic = 'force-dynamic'

// GET /api/search?q=uniswap&type=all|projects|reviews|users
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()
  const type = searchParams.get('type') || 'all'
  const limit = parseInt(searchParams.get('limit') || '10')
  const analyze = searchParams.get('analyze') === 'true' // Trigger AI analysis

  if (!query || query.length < 2) {
    return NextResponse.json({ 
      error: 'Query must be at least 2 characters',
      projects: [],
      reviews: [],
      users: [],
    }, { status: 400 })
  }

  const results: {
    projects: any[]
    reviews: any[]
    users: any[]
    aiAnalysis?: any
  } = {
    projects: [],
    reviews: [],
    users: [],
  }

  try {
    // Note: SQLite uses LIKE for case-insensitive search (contains is case-insensitive by default)
    const lowerQuery = query.toLowerCase()

    // Search Projects
    if (type === 'all' || type === 'projects') {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: lowerQuery, mode: 'insensitive' } },
            { address: { contains: lowerQuery, mode: 'insensitive' } },
            { category: { contains: lowerQuery, mode: 'insensitive' } },
            { description: { contains: lowerQuery, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { reviewCount: 'desc' },
        select: {
          id: true,
          address: true,
          name: true,
          category: true,
          avgRating: true,
          reviewCount: true,
          currentRank: true,
        },
      })
      results.projects = projects
    }

    // Search Reviews (full-text on content)
    if (type === 'all' || type === 'reviews') {
      const reviews = await prisma.review.findMany({
        where: {
          content: { contains: lowerQuery, mode: 'insensitive' },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: { select: { address: true, displayName: true, avatarUrl: true } },
          project: { select: { address: true, name: true, category: true } },
        },
      })
      results.reviews = reviews.map(r => ({
        id: r.id,
        content: r.content,
        contentPreview: r.content.length > 150 ? r.content.substring(0, 150) + '...' : r.content,
        rating: r.rating,
        upvotes: r.upvotes,
        downvotes: r.downvotes,
        createdAt: r.createdAt.toISOString(),
        reviewer: r.reviewer,
        project: r.project,
      }))
    }

    // Search Users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { address: { contains: lowerQuery, mode: 'insensitive' } },
            { displayName: { contains: lowerQuery, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { reputationScore: 'desc' },
        select: {
          id: true,
          address: true,
          displayName: true,
          avatarUrl: true,
          reputationScore: true,
          totalReviews: true,
          feeTier: true,
        },
      })
      results.users = users
    }

    // Trigger AI Analysis if requested and no project matches found
    if (analyze && results.projects.length === 0) {
      console.log(`[Search] No DB match for "${query}", triggering Ma'at analysis...`)
      try {
        const analysis = await analyzeProject(query)
        results.aiAnalysis = {
          source: 'maat',
          cached: analysis._cached || false,
          data: analysis,
        }
        
        // Optionally create project entry for future searches
        if (analysis.status !== 'UNSTABLE' && analysis.name !== query) {
          // Create or update project in DB for faster future lookups
          await prisma.project.upsert({
            where: { address: query.toLowerCase() },
            update: { name: analysis.name, description: analysis.summary },
            create: {
              address: query.toLowerCase(),
              name: analysis.name,
              category: mapTypeToCategory(analysis.type),
              description: analysis.summary,
            },
          })
        }
      } catch (err) {
        console.error('[Search] AI analysis failed:', err)
      }
    }

    return NextResponse.json({
      query,
      totalResults: results.projects.length + results.reviews.length + results.users.length,
      ...results,
    })
  } catch (error) {
    console.error('[Search] Error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

// Map Ma'at project type to Kindred category
function mapTypeToCategory(type: string): string {
  const mapping: Record<string, string> = {
    'DEX': 'k/perp-dex',
    'DeFi': 'k/defi',
    'NFT': 'k/nft',
    'AI': 'k/ai',
    'Meme': 'k/memecoin',
    'Infrastructure': 'k/infra',
  }
  return mapping[type] || 'k/defi'
}
