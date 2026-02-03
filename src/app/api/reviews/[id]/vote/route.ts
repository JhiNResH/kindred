import { NextRequest, NextResponse } from 'next/server'

// POST /api/reviews/[id]/vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    const { direction, voterAddress } = body

    // Validation
    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Direction must be "up" or "down"' }, { status: 400 })
    }
    if (!voterAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid voter address' }, { status: 400 })
    }

    // TODO: In real implementation:
    // 1. Check if user already voted
    // 2. Update vote in database
    // 3. Update review's upvotes/downvotes count
    // 4. Update reviewer's reputation

    return NextResponse.json({
      success: true,
      reviewId: id,
      direction,
      voterAddress,
      message: `Vote recorded: ${direction}vote on review ${id}`,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
