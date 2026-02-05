import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/reviews/[id]/vote
 * Update upvote/downvote count after on-chain vote transaction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { direction, amount } = body // direction: "up" | "down", amount: vote weight (optional)
    
    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid vote direction' }, { status: 400 })
    }
    
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    
    // Update vote count
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        upvotes: direction === 'up' ? review.upvotes + 1 : review.upvotes,
        downvotes: direction === 'down' ? review.downvotes + 1 : review.downvotes,
      },
    })
    
    return NextResponse.json({
      id: updatedReview.id,
      upvotes: updatedReview.upvotes,
      downvotes: updatedReview.downvotes,
      netScore: updatedReview.upvotes - updatedReview.downvotes,
    })
  } catch (error) {
    console.error('Error updating vote:', error)
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 })
  }
}
