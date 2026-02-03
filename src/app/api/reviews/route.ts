import { NextRequest, NextResponse } from 'next/server'

// Types
interface Review {
  id: string
  targetAddress: string
  targetName: string
  reviewerAddress: string
  rating: number
  content: string
  category: 'k/defi' | 'k/memecoin' | 'k/perp-dex' | 'k/ai'
  predictedRank: number | null
  stakeAmount: string
  photoUrls: string[]
  upvotes: number
  downvotes: number
  createdAt: string
}

// In-memory store (replace with DB later)
const reviews: Review[] = [
  {
    id: 'rev_1',
    targetAddress: '0x1234567890abcdef1234567890abcdef12345678',
    targetName: 'Hyperliquid',
    reviewerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    rating: 5,
    content: 'Best perp DEX by far. Low fees, fast execution, great UX.',
    category: 'k/perp-dex',
    predictedRank: 1,
    stakeAmount: '5000000000000000000',
    photoUrls: [],
    upvotes: 42,
    downvotes: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_2',
    targetAddress: '0xdeadbeef1234567890abcdef1234567890abcdef',
    targetName: 'Aave',
    reviewerAddress: '0x1111222233334444555566667777888899990000',
    rating: 4,
    content: 'Solid lending protocol. Been using it for 2 years without issues.',
    category: 'k/defi',
    predictedRank: 2,
    stakeAmount: '10000000000000000000',
    photoUrls: [],
    upvotes: 28,
    downvotes: 5,
    createdAt: new Date().toISOString(),
  },
]

// GET /api/reviews
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const target = searchParams.get('target')
  const sort = searchParams.get('sort') || 'hot' // hot, new, top

  let filtered = [...reviews]

  if (category) {
    filtered = filtered.filter(r => r.category === category)
  }
  if (target) {
    filtered = filtered.filter(r => 
      r.targetAddress.toLowerCase() === target.toLowerCase() ||
      r.targetName.toLowerCase().includes(target.toLowerCase())
    )
  }

  // Sort
  switch (sort) {
    case 'new':
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'top':
      filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      break
    case 'hot':
    default:
      // Hot = score decay over time
      filtered.sort((a, b) => {
        const scoreA = (a.upvotes - a.downvotes) / Math.pow((Date.now() - new Date(a.createdAt).getTime()) / 3600000 + 2, 1.5)
        const scoreB = (b.upvotes - b.downvotes) / Math.pow((Date.now() - new Date(b.createdAt).getTime()) / 3600000 + 2, 1.5)
        return scoreB - scoreA
      })
  }

  return NextResponse.json({
    reviews: filtered,
    total: filtered.length,
  })
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

    const review: Review = {
      id: `rev_${Date.now()}`,
      targetAddress: body.targetAddress,
      targetName: body.targetName || 'Unknown',
      reviewerAddress: body.reviewerAddress || '0x0000000000000000000000000000000000000000',
      rating: body.rating,
      content: body.content,
      category: body.category || 'k/defi',
      predictedRank: body.predictedRank || null,
      stakeAmount: body.stakeAmount || '0',
      photoUrls: body.photoUrls || [],
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    }

    reviews.push(review)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
