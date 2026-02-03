import { NextRequest, NextResponse } from 'next/server'

// Types
interface Stake {
  id: string
  stakerAddress: string
  reviewId: string | null
  projectAddress: string
  projectName: string
  predictedRank: number
  amount: string
  status: 'active' | 'won' | 'lost' | 'pending'
  createdAt: string
  settledAt: string | null
  payout: string | null
}

// In-memory stakes
const stakes: Stake[] = [
  {
    id: 'stake_1',
    stakerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    reviewId: 'rev_1',
    projectAddress: '0x1234567890abcdef1234567890abcdef12345678',
    projectName: 'Hyperliquid',
    predictedRank: 1,
    amount: '5000000000000000000', // 5 tokens
    status: 'active',
    createdAt: new Date().toISOString(),
    settledAt: null,
    payout: null,
  },
]

// GET /api/stakes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const project = searchParams.get('project')
  const status = searchParams.get('status')

  let filtered = [...stakes]

  if (address) {
    filtered = filtered.filter(s => s.stakerAddress.toLowerCase() === address.toLowerCase())
  }
  if (project) {
    filtered = filtered.filter(s => s.projectAddress.toLowerCase() === project.toLowerCase())
  }
  if (status) {
    filtered = filtered.filter(s => s.status === status)
  }

  // Calculate totals
  const totalStaked = filtered.reduce((sum, s) => sum + BigInt(s.amount), BigInt(0))
  const activeStakes = filtered.filter(s => s.status === 'active')
  const wonStakes = filtered.filter(s => s.status === 'won')

  return NextResponse.json({
    stakes: filtered,
    total: filtered.length,
    totalStaked: totalStaked.toString(),
    activeCount: activeStakes.length,
    wonCount: wonStakes.length,
  })
}

// POST /api/stakes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.stakerAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid staker address' }, { status: 400 })
    }
    if (!body.projectAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid project address' }, { status: 400 })
    }
    if (!body.predictedRank || body.predictedRank < 1 || body.predictedRank > 100) {
      return NextResponse.json({ error: 'Predicted rank must be 1-100' }, { status: 400 })
    }
    if (!body.amount || BigInt(body.amount) <= 0) {
      return NextResponse.json({ error: 'Stake amount must be positive' }, { status: 400 })
    }

    const stake: Stake = {
      id: `stake_${Date.now()}`,
      stakerAddress: body.stakerAddress,
      reviewId: body.reviewId || null,
      projectAddress: body.projectAddress,
      projectName: body.projectName || 'Unknown',
      predictedRank: body.predictedRank,
      amount: body.amount,
      status: 'active',
      createdAt: new Date().toISOString(),
      settledAt: null,
      payout: null,
    }

    stakes.push(stake)

    return NextResponse.json(stake, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
