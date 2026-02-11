import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rankings/[category] — Get current stake-weighted rankings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Find active ranking for this category
    const ranking = await prisma.opinionRanking.findFirst({
      where: {
        category,
        isActive: true,
      },
      include: {
        items: {
          orderBy: { currentRank: 'asc' },
          take: Math.min(limit, 50),
        },
      },
    });

    if (!ranking) {
      return NextResponse.json(
        { error: `No active ranking found for category: ${category}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: ranking.category,
      title: ranking.title,
      currentRanking: ranking.items.map((item) => ({
        rank: item.currentRank,
        itemId: item.itemId,
        name: item.name,
        logoUrl: item.logoUrl,
        chain: item.chain,
        credibilityScore: Math.round(item.currentScore * 10) / 10,
        stakeWeightedVotes: Math.round(item.stakeWeightedVotes * 100) / 100,
        totalVoters: item.voterCount,
        consensus: item.consensus,
      })),
      metadata: {
        lastUpdatedAt: ranking.updatedAt.getTime(),
        nextResolutionAt: ranking.resolvesAt.getTime(),
        totalStaked: ranking.totalStaked,
        totalVoters: ranking.totalVoters,
        daysUntilResolution: Math.max(
          0,
          Math.ceil(
            (ranking.resolvesAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        ),
      },
    });
  } catch (error) {
    console.error('[RANKINGS] Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
