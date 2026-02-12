import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rankings/history — Get all past resolutions across categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'));
    const category = searchParams.get('category');

    const where = category
      ? { ranking: { category } }
      : {};

    const resolutions = await prisma.opinionResolution.findMany({
      where,
      include: {
        ranking: { select: { category: true, title: true } },
      },
      orderBy: { resolvedAt: 'desc' },
      take: limit,
    });

    const results = resolutions.map((r) => ({
      id: r.id,
      category: r.ranking.category,
      title: r.ranking.title,
      week: r.week,
      resolvedAt: r.resolvedAt,
      finalRankings: JSON.parse(r.finalRankings),
      stats: {
        totalDroneDistributed: r.totalDroneDistributed,
        totalVotersRewarded: r.totalVotersRewarded,
        avgRewardPerVoter: r.avgRewardPerVoter,
      },
    }));

    return NextResponse.json({ resolutions: results, total: results.length });
  } catch (error) {
    console.error('[HISTORY] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
