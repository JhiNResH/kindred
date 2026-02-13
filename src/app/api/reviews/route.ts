import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { checkReviewQuality } from '@/lib/gemini-review-check'
import { analyzeImageContent } from '@/lib/gemini-image-analysis'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'

// GET /api/reviews
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const target = searchParams.get('target')
  const q = searchParams.get('q') // Full-text search on content
  const sort = searchParams.get('sort') || 'hot' // hot, new, top

  try {
    const where: any = {}
    
    if (category) {
      where.project = { category }
    }
    if (target) {
      const lowerTarget = target.toLowerCase()
      where.OR = [
        { project: { address: lowerTarget } },
        { project: { name: { contains: lowerTarget } } },
      ]
    }
    // Full-text search on review content (SQLite: contains is case-insensitive)
    if (q) {
      where.content = { contains: q.toLowerCase() }
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
      reviewerAddress: r.reviewer?.address || null,
      rating: r.rating,
      content: r.content,
      category: r.project.category,
      predictedRank: r.predictedRank,
      stakeAmount: r.stakeAmount,
      photoUrls: r.photoUrls ? JSON.parse(r.photoUrls) : [],
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      createdAt: r.createdAt.toISOString(),
      nftTokenId: r.nftTokenId, // ERC-721 token ID from MaatComment contract
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
    
    // Check auth: either agent token or user address
    let agentId: string | null = null
    let userId: string | null = null

    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET)
        agentId = decoded.agentId
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    } else if (body.reviewerAddress) {
      // User review path (existing logic)
      userId = body.reviewerAddress
    } else {
      return NextResponse.json({ error: 'Unauthorized - provide Bearer token or reviewerAddress' }, { status: 401 })
    }
    
    // Validation
    if (!body.content || body.content.length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters' }, { status: 400 })
    }

    // Check Scarab stake requirement
    const stakeAmount = body.stakeAmount ? parseInt(body.stakeAmount) : 0
    if (stakeAmount < 1) {
      return NextResponse.json(
        { error: 'Minimum 1 Scarab stake required for reviews' },
        { status: 400 }
      )
    }

    // TODO: Verify user has sufficient Scarab balance (requires on-chain check or local DB balance tracking)
    // For MVP, we trust the client and will validate on settlement

    // Find or create project (needed for Gemini check context)
    let project = await prisma.project.findUnique({
      where: { address: body.targetAddress?.toLowerCase() || body.projectId?.toLowerCase() || 'unknown' },
    })
    if (!project) {
      project = await prisma.project.create({
        data: {
          address: body.targetAddress?.toLowerCase() || body.projectId?.toLowerCase() || 'unknown',
          name: body.projectName || body.targetName || 'Unknown Project',
          category: body.category || 'k/defi',
        },
      })
    }

    // Quality check with Gemini API
    const projectName = body.projectName || body.targetName || project.name
    const qualityCheck = await checkReviewQuality(body.content, projectName, project.category)

    // Reject if quality score is too low
    if (qualityCheck.status === 'rejected') {
      return NextResponse.json(
        {
          error: 'Review rejected - quality check failed',
          details: qualityCheck.reason,
          qualityIssues: qualityCheck.qualityIssues,
        },
        { status: 400 }
      )
    }

    // Image analysis for gourmet/restaurant reviews
    let imageAnalysis = null
    if (project.category === 'k/gourmet' && body.photoUrls && Array.isArray(body.photoUrls) && body.photoUrls.length > 0) {
      try {
        // Analyze first photo
        imageAnalysis = await analyzeImageContent(body.photoUrls[0], project.name)
      } catch (e) {
        console.error('Image analysis error:', e)
        // Continue even if image analysis fails
      }
    }

    // Create review (for agent or user)
    let reviewData: any = {
      rating: body.rating || 5,
      content: body.content,
      predictedRank: body.predictedRank || null,
      stakeAmount: stakeAmount.toString(), // Scarab stake (required for settlement)
      photoUrls: body.photoUrls ? JSON.stringify(body.photoUrls) : null,
      projectId: project.id,
      status: qualityCheck.status === 'flagged' ? 'flagged' : 'active', // Mark flagged reviews
    }

    if (agentId) {
      reviewData.agentId = agentId
    } else if (userId) {
      // Find or create user
      let user = await prisma.user.findUnique({
        where: { address: userId.toLowerCase() },
      })
      if (!user) {
        user = await prisma.user.create({
          data: {
            address: userId.toLowerCase(),
            displayName: userId.substring(0, 10),
          },
        })
      }
      reviewData.reviewerId = user.id
    }

    const review = await prisma.review.create({
      data: reviewData,
      include: {
        reviewer: { select: { address: true, displayName: true } },
        agent: { select: { id: true, name: true, chain: true } },
        project: { select: { address: true, name: true, category: true } },
      },
    })

    return NextResponse.json({
      id: review.id,
      targetAddress: review.project.address,
      targetName: review.project.name,
      reviewerAddress: review.reviewer?.address || null,
      agentId: review.agent?.id || null,
      agentName: review.agent?.name || null,
      rating: review.rating,
      content: review.content,
      category: review.project.category,
      predictedRank: review.predictedRank,
      stakeAmount: review.stakeAmount,
      photoUrls: review.photoUrls ? JSON.parse(review.photoUrls) : [],
      upvotes: review.upvotes,
      downvotes: review.downvotes,
      createdAt: review.createdAt.toISOString(),
      nftTokenId: review.nftTokenId,
      status: review.status,
      // Quality check info
      qualityScore: qualityCheck.score,
      qualityStatus: qualityCheck.status,
      ...(qualityCheck.status === 'flagged' && {
        qualityWarning: qualityCheck.reason,
        qualityIssues: qualityCheck.qualityIssues,
      }),
      // Image analysis (for gourmet reviews)
      ...(imageAnalysis && {
        imageAnalysis: {
          isFood: imageAnalysis.isFood,
          quality: imageAnalysis.quality,
          cuisine: imageAnalysis.cuisine,
          relevance: imageAnalysis.relevance,
        },
      }),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review', details: String(error) }, { status: 500 })
  }
}
