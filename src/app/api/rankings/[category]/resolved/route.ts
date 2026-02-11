import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rankings/[category]/resolved — Get resolved ranking history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || 'latest';

    // Find ranking for this category
    const ranking = await prisma.opinionRanking.findFirst({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });

    if (!ranking) {
      return NextResponse.json(
        { error: `No ranking found for category: ${category}` },
        { status: 404 }
      );
    }

    // Get resolution
    let resolution;
    if (week === 'latest') {
      resolution = await prisma.opinionResolution.findFirst({
        where: { rankingId: ranking.id },
        orderBy: { resolvedAt: 'desc' },
      });
    } else {
      resolution = await prisma.opinionResolution.findUnique({
        where: { rankingId_week: { rankingId: ranking.id, week } },
      });
    }

    if (!resolution) {
      return NextResponse.json(
        { error: 'No resolved rankings found' },
        { status: 404 }
      );
    }

    const finalRankings = JSON.parse(resolution.finalRankings);

    return NextResponse.json({
      category,
      week: resolution.week,
      resolvedAt: resolution.resolvedAt.getTime(),
      finalRanking: finalRankings,
      rewardStats: {
        totalDroneDistributed: resolution.totalDroneDistributed,
        totalVotersRewarded: resolution.totalVotersRewarded,
        avgRewardPerVoter: resolution.avgRewardPerVoter,
      },
    });
  } catch (error) {
    console.error('[RANKINGS] Error fetching resolved:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
