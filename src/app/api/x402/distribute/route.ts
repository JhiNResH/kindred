/**
 * x402 Payment Distribution API
 * 
 * Distributes unlock fees to:
 * - 70% to content author
 * - 20% to early upvoters (weighted by stake)
 * - 10% protocol fee (treasury)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const AUTHOR_SHARE = 0.70 // 70%
const EARLY_VOTER_SHARE = 0.20 // 20%
const PROTOCOL_SHARE = 0.10 // 10%

interface Upvoter {
  address: string
  stakeAmount: bigint
  votedAt: Date
}

/**
 * POST - Distribute payment to stakeholders
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, amount, payer } = body

    if (!contentId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const totalAmount = parseFloat(amount)
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    console.log('[x402 Distribute] Processing:', { contentId, amount: totalAmount, payer })

    // Get content details
    const review = await prisma.review.findUnique({
      where: { id: contentId },
      select: {
        reviewerAddress: true,
        createdAt: true,
      },
    })

    if (!review) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Get early upvoters (voted within first 24h)
    const earlyVoteCutoff = new Date(review.createdAt)
    earlyVoteCutoff.setHours(earlyVoteCutoff.getHours() + 24)

    // TODO: Get actual upvotes from blockchain or database
    // For now, use mock data for demonstration
    const upvoters: Upvoter[] = await getEarlyUpvoters(contentId, earlyVoteCutoff)

    // Calculate distributions
    const authorAmount = totalAmount * AUTHOR_SHARE
    const earlyVoterPool = totalAmount * EARLY_VOTER_SHARE
    const protocolAmount = totalAmount * PROTOCOL_SHARE

    // Distribute to early voters (weighted by stake)
    const totalStake = upvoters.reduce((sum, u) => sum + Number(u.stakeAmount), 0)
    const distributions = upvoters.map((upvoter) => {
      const weight = totalStake > 0 ? Number(upvoter.stakeAmount) / totalStake : 0
      const amount = earlyVoterPool * weight
      return {
        address: upvoter.address,
        amount: amount.toFixed(6),
        share: (weight * 100).toFixed(2) + '%',
      }
    })

    // Record distribution
    await prisma.paymentDistribution.create({
      data: {
        contentId,
        totalAmount: totalAmount.toString(),
        authorAddress: review.reviewerAddress,
        authorAmount: authorAmount.toFixed(6),
        earlyVoterAmount: earlyVoterPool.toFixed(6),
        protocolAmount: protocolAmount.toFixed(6),
        distributions: JSON.stringify(distributions),
        payer: payer || 'anonymous',
      },
    })

    // Update earned amounts (for leaderboard)
    await updateEarnedAmounts(review.reviewerAddress, authorAmount, distributions)

    console.log('[x402 Distribute] ✅ Distribution complete')

    return NextResponse.json({
      status: 'distributed',
      summary: {
        total: totalAmount.toFixed(6),
        author: {
          address: review.reviewerAddress,
          amount: authorAmount.toFixed(6),
          share: '70%',
        },
        earlyVoters: {
          count: upvoters.length,
          totalAmount: earlyVoterPool.toFixed(6),
          share: '20%',
          distributions,
        },
        protocol: {
          amount: protocolAmount.toFixed(6),
          share: '10%',
        },
      },
    })
  } catch (error) {
    console.error('[x402 Distribute] Error:', error)
    return NextResponse.json({ error: 'Failed to distribute payment' }, { status: 500 })
  }
}

/**
 * Get early upvoters (within 24h of content creation)
 */
async function getEarlyUpvoters(contentId: string, cutoff: Date): Promise<Upvoter[]> {
  // TODO: Fetch from blockchain events or votes table
  // For now, return mock data
  
  try {
    const votes = await prisma.vote.findMany({
      where: {
        reviewId: contentId,
        voteType: 'upvote',
        createdAt: { lte: cutoff },
      },
      select: {
        userAddress: true,
        stakeAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return votes.map((v) => ({
      address: v.userAddress,
      stakeAmount: BigInt(v.stakeAmount || '0'),
      votedAt: v.createdAt,
    }))
  } catch (error) {
    console.error('[x402 Distribute] Failed to fetch votes:', error)
    return []
  }
}

/**
 * Update earned amounts for users
 */
async function updateEarnedAmounts(
  authorAddress: string,
  authorAmount: number,
  distributions: Array<{ address: string; amount: string }>
) {
  try {
    // Update author earnings
    await prisma.user.upsert({
      where: { address: authorAddress.toLowerCase() },
      create: {
        address: authorAddress.toLowerCase(),
        totalEarned: authorAmount.toString(),
      },
      update: {
        totalEarned: {
          increment: authorAmount,
        },
      },
    })

    // Update early voter earnings
    for (const dist of distributions) {
      const amount = parseFloat(dist.amount)
      if (amount > 0) {
        await prisma.user.upsert({
          where: { address: dist.address.toLowerCase() },
          create: {
            address: dist.address.toLowerCase(),
            totalEarned: amount.toString(),
          },
          update: {
            totalEarned: {
              increment: amount,
            },
          },
        })
      }
    }
  } catch (error) {
    console.error('[x402 Distribute] Failed to update earnings:', error)
  }
}

/**
 * GET - Get distribution history for content
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json({ error: 'Missing contentId' }, { status: 400 })
    }

    const distributions = await prisma.paymentDistribution.findMany({
      where: { contentId },
      orderBy: { createdAt: 'desc' },
    })

    const total = distributions.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0)

    return NextResponse.json({
      contentId,
      totalEarned: total.toFixed(6),
      distributionCount: distributions.length,
      distributions: distributions.map((d) => ({
        timestamp: d.createdAt,
        amount: d.totalAmount,
        author: {
          address: d.authorAddress,
          amount: d.authorAmount,
        },
        earlyVoters: JSON.parse(d.distributions as string),
        protocol: d.protocolAmount,
      })),
    })
  } catch (error) {
    console.error('[x402 Distribute] Error fetching distributions:', error)
    return NextResponse.json({ error: 'Failed to fetch distributions' }, { status: 500 })
  }
}
