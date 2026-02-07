/**
 * Earnings API - Get user's total earnings from content and early voting
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    const normalizedAddress = address.toLowerCase()
    console.log('[Earnings API] Fetching for:', normalizedAddress)

    // Get user earnings
    const user = await prisma.user.findUnique({
      where: { address: normalizedAddress },
      select: { totalEarned: true },
    })

    const totalEarned = user?.totalEarned ? parseFloat(user.totalEarned) : 0

    // Get distributions where user was author (70% share)
    const authorDistributions = await prisma.paymentDistribution.findMany({
      where: {
        authorAddress: normalizedAddress,
      },
      select: {
        contentId: true,
        authorAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Get distributions where user was early voter (20% share)
    // Note: This requires parsing JSON, which is not ideal for queries
    // In production, store this in a separate table
    const allDistributions = await prisma.paymentDistribution.findMany({
      select: {
        contentId: true,
        distributions: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for performance
    })

    const voterDistributions = allDistributions
      .flatMap((d) => {
        try {
          const dists = JSON.parse(d.distributions as string) as Array<{
            address: string
            amount: string
          }>
          return dists
            .filter((dist) => dist.address.toLowerCase() === normalizedAddress)
            .map((dist) => ({
              contentId: d.contentId,
              amount: dist.amount,
              createdAt: d.createdAt,
              source: 'early_voter' as const,
            }))
        } catch {
          return []
        }
      })
      .slice(0, 10)

    // Calculate breakdowns
    const fromContent = authorDistributions.reduce(
      (sum, d) => sum + parseFloat(d.authorAmount),
      0
    )
    const fromVoting = voterDistributions.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    )

    // Combine recent distributions
    const recentDistributions = [
      ...authorDistributions.map((d) => ({
        contentId: d.contentId,
        amount: d.authorAmount,
        source: 'author' as const,
        timestamp: d.createdAt.toISOString(),
      })),
      ...voterDistributions.map((d) => ({
        contentId: d.contentId,
        amount: d.amount,
        source: d.source,
        timestamp: d.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      address: normalizedAddress,
      totalEarned: totalEarned.toFixed(6),
      fromContent: fromContent.toFixed(6),
      fromVoting: fromVoting.toFixed(6),
      recentDistributions: recentDistributions.slice(0, 10),
    })
  } catch (error) {
    console.error('[Earnings API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
