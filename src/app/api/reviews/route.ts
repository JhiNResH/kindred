import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reviews
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const target = searchParams.get('target')
  const sort = searchParams.get('sort') || 'hot' // hot, new, top

  try {
    const where: any = {}
    
    if (category) {
      where.project = { category }
    }
    if (target) {
      where.OR = [
        { project: { address: { equals: target, mode: 'insensitive' } } },
        { project: { name: { contains: target, mode: 'insensitive' } } },
      ]
    }

    let reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: { select: { address: true, displayName: true, avatarUrl: true } },
        project: { select: { address: true, name: true, category: true } },
      },
      orderBy: sort === 'new' 
        ? { createdAt: 'desc' }
        : sort === 'top'
        ? [{ upvotes: 'desc' }, { downvotes: 'asc' }]
        : { createdAt: 'desc' }, // Hot algorithm done client-side for simplicity
    })

    // Transform to match expected format
    const transformed = reviews.map(r => ({
      id: r.id,
      targetAddress: r.project.address,
      targetName: r.project.name,
      reviewerAddress: r.reviewer.address,
      rating: r.rating,
      content: r.content,
      category: r.project.category,
      predictedRank: r.predictedRank,
      stakeAmount: r.stakeAmount,
      photoUrls: r.photoUrls ? JSON.parse(r.photoUrls) : [],
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      createdAt: r.createdAt.toISOString(),
      nftTokenId: r.nftTokenId, // ERC-721 token ID from KindredComment contract
    }))

    // Sort by hot if requested
    if (sort === 'hot') {
      transformed.sort((a, b) => {
        const scoreA = (a.upvotes - a.downvotes) / Math.pow((Date.now() - new Date(a.createdAt).getTime()) / 3600000 + 2, 1.5)
        const scoreB = (b.upvotes - b.downvotes) / Math.pow((Date.now() - new Date(b.createdAt).getTime()) / 3600000 + 2, 1.5)
        return scoreB - scoreA
      })
    }

    return NextResponse.json({
      reviews: transformed,
      total: transformed.length,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.targetAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid target address' }, { status: 400 })
    }
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }
    if (!body.content || body.content.length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters' }, { status: 400 })
    }
    if (!body.reviewerAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid reviewer address' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { address: body.reviewerAddress.toLowerCase() },
    })
    if (!user) {
      user = await prisma.user.create({
        data: {
          address: body.reviewerAddress.toLowerCase(),
          displayName: body.reviewerAddress.substring(0, 10),
        },
      })
    }

    // Find or create project
    let project = await prisma.project.findUnique({
      where: { address: body.targetAddress.toLowerCase() },
    })
    if (!project) {
      project = await prisma.project.create({
        data: {
          address: body.targetAddress.toLowerCase(),
          name: body.targetName || 'Unknown Project',
          category: body.category || 'k/defi',
        },
      })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: body.rating,
        content: body.content,
        predictedRank: body.predictedRank || null,
        stakeAmount: body.stakeAmount || '0',
        photoUrls: body.photoUrls ? JSON.stringify(body.photoUrls) : null,
        reviewerId: user.id,
        projectId: project.id,
      },
      include: {
        reviewer: { select: { address: true, displayName: true } },
        project: { select: { address: true, name: true, category: true } },
      },
    })

    return NextResponse.json({
      id: review.id,
      targetAddress: review.project.address,
      targetName: review.project.name,
      reviewerAddress: review.reviewer.address,
      rating: review.rating,
      content: review.content,
      category: review.project.category,
      predictedRank: review.predictedRank,
      stakeAmount: review.stakeAmount,
      photoUrls: review.photoUrls ? JSON.parse(review.photoUrls) : [],
      upvotes: review.upvotes,
      downvotes: review.downvotes,
      createdAt: review.createdAt.toISOString(),
      nftTokenId: review.nftTokenId, // ERC-721 token ID from KindredComment contract
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
