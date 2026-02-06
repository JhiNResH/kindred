import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'

// GET /api/stakes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const project = searchParams.get('project')
  const status = searchParams.get('status')

  try {
    const where: any = {}

    if (address) {
      where.staker = { address: address.toLowerCase() }
    }
    if (project) {
      where.project = { address: project.toLowerCase() }
    }
    if (status) {
      where.status = status
    }

    const stakes = await prisma.stake.findMany({
      where,
      include: {
        staker: { select: { address: true, displayName: true } },
        project: { select: { address: true, name: true, category: true } },
        review: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to expected format
    const transformed = stakes.map(s => ({
      id: s.id,
      stakerAddress: s.staker.address,
      reviewId: s.reviewId,
      projectAddress: s.project.address,
      projectName: s.project.name,
      predictedRank: s.predictedRank,
      amount: s.amount,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      settledAt: s.settledAt?.toISOString() || null,
      payout: s.payout,
    }))

    // Calculate totals
    const totalStaked = stakes.reduce((sum, s) => sum + BigInt(s.amount), BigInt(0))
    const activeStakes = stakes.filter(s => s.status === 'active')
    const wonStakes = stakes.filter(s => s.status === 'won')

    return NextResponse.json({
      stakes: transformed,
      total: transformed.length,
      totalStaked: totalStaked.toString(),
      activeCount: activeStakes.length,
      wonCount: wonStakes.length,
    })
  } catch (error) {
    console.error('Error fetching stakes:', error)
    return NextResponse.json({ error: 'Failed to fetch stakes' }, { status: 500 })
  }
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

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { address: body.stakerAddress.toLowerCase() },
    })
    if (!user) {
      user = await prisma.user.create({
        data: {
          address: body.stakerAddress.toLowerCase(),
          displayName: body.stakerAddress.substring(0, 10),
        },
      })
    }

    // Find project
    const project = await prisma.project.findUnique({
      where: { address: body.projectAddress.toLowerCase() },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create stake
    const stake = await prisma.stake.create({
      data: {
        amount: body.amount,
        predictedRank: body.predictedRank,
        txHash: body.txHash || null,
        stakerId: user.id,
        projectId: project.id,
        reviewId: body.reviewId || null,
      },
      include: {
        staker: { select: { address: true } },
        project: { select: { address: true, name: true } },
      },
    })

    return NextResponse.json({
      id: stake.id,
      stakerAddress: stake.staker.address,
      reviewId: stake.reviewId,
      projectAddress: stake.project.address,
      projectName: stake.project.name,
      predictedRank: stake.predictedRank,
      amount: stake.amount,
      status: stake.status,
      createdAt: stake.createdAt.toISOString(),
      settledAt: null,
      payout: null,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating stake:', error)
    return NextResponse.json({ error: 'Failed to create stake' }, { status: 500 })
  }
}
