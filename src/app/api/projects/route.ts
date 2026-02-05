import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/projects - List/search projects from database
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase()
  const category = searchParams.get('category')?.toLowerCase()
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const sort = searchParams.get('sort') || 'rating' // rating, reviews, rank, newest

  try {
    // Build where clause
    const where: any = {}
    
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { address: { contains: query } },
        { description: { contains: query } },
      ]
    }
    
    if (category) {
      // Support both "defi" and "k/defi" formats
      const normalizedCategory = category.startsWith('k/') ? category : `k/${category}`
      where.category = normalizedCategory
    }

    // Build orderBy
    let orderBy: any = { avgRating: 'desc' }
    switch (sort) {
      case 'reviews':
        orderBy = { reviewCount: 'desc' }
        break
      case 'rank':
        orderBy = { currentRank: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'staked':
        orderBy = { totalStaked: 'desc' }
        break
    }

    // Get total count
    const total = await prisma.project.count({ where })

    // Get projects
    const projects = await prisma.project.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        address: true,
        name: true,
        description: true,
        website: true,
        category: true,
        avgRating: true,
        reviewCount: true,
        totalStaked: true,
        currentRank: true,
        createdAt: true,
      },
    })

    // Transform to expected format
    const transformed = projects.map(p => ({
      id: p.id,
      address: p.address,
      name: p.name,
      description: p.description,
      website: p.website,
      category: p.category,
      score: p.avgRating,
      reviewsCount: p.reviewCount,
      totalStaked: p.totalStaked,
      rank: p.currentRank,
    }))

    return NextResponse.json({
      projects: transformed,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + projects.length < total,
      },
    })
  } catch (error) {
    console.error('[Projects API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.address?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 })
    }
    if (!body.name || body.name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    // Check if project already exists
    const existing = await prisma.project.findUnique({
      where: { address: body.address.toLowerCase() },
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Project already exists', project: existing }, { status: 409 })
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        address: body.address.toLowerCase(),
        name: body.name,
        description: body.description || null,
        website: body.website || null,
        category: body.category || 'k/defi',
      },
    })

    return NextResponse.json({
      id: project.id,
      address: project.address,
      name: project.name,
      description: project.description,
      website: project.website,
      category: project.category,
      score: project.avgRating,
      reviewsCount: project.reviewCount,
    }, { status: 201 })
  } catch (error) {
    console.error('[Projects API] Create error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
