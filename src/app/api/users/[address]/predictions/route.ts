import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[address]/predictions — Get user's prediction history + accuracy
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const addr = address.toLowerCase();

    const votes = await prisma.opinionVote.findMany({
      where: { voterAddress: addr },
      include: {
        item: { select: { name: true, itemId: true, finalRank: true, finalScore: true } },
        ranking: { select: { category: true, title: true, resolvedAt: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Split into active vs resolved
    const active = votes
      .filter((v) => v.ranking.isActive)
      .map((v) => ({
        category: v.ranking.category,
        item: v.item.name,
        predictedRank: v.rankedPosition,
        staked: v.stakeAmount,
      }));

    const resolved = votes
      .filter((v) => !v.ranking.isActive && v.ranking.resolvedAt)
      .map((v) => ({
        category: v.ranking.category,
        item: v.item.name,
        predictedRank: v.rankedPosition,
        finalRank: v.item.finalRank,
        accuracy: v.accuracy,
        staked: v.stakeAmount,
        scarabEarned: v.rewardEarned || 0,
        resolvedAt: v.ranking.resolvedAt,
      }));

    // Aggregate stats
    const resolvedWithAccuracy = resolved.filter((r) => r.accuracy !== null);
    const avgAccuracy = resolvedWithAccuracy.length > 0
      ? resolvedWithAccuracy.reduce((sum, r) => sum + (r.accuracy || 0), 0) / resolvedWithAccuracy.length
      : 0;
    const totalDroneEarned = resolved.reduce((sum, r) => sum + r.scarabEarned, 0);

    return NextResponse.json({
      address: addr,
      stats: {
        totalPredictions: votes.length,
        activePredictions: active.length,
        resolvedPredictions: resolved.length,
        avgAccuracy: Math.round(avgAccuracy * 1000) / 1000,
        totalDroneEarned: Math.round(totalDroneEarned * 100) / 100,
      },
      active,
      resolved,
    });
  } catch (error) {
    console.error('[PREDICTIONS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}
