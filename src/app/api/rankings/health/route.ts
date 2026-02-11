import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rankings/health — Health check
export async function GET() {
  try {
    const activeRankings = await prisma.opinionRanking.count({
      where: { isActive: true },
    });

    const totalVoters = await prisma.opinionVote.groupBy({
      by: ['voterAddress'],
    });

    const totalStaked = await prisma.opinionVote.aggregate({
      _sum: { stakeAmount: true },
    });

    const nextResolution = await prisma.opinionRanking.findFirst({
      where: { isActive: true },
      orderBy: { resolvesAt: 'asc' },
      select: { resolvesAt: true },
    });

    return NextResponse.json({
      status: 'healthy',
      activeCategoriesCount: activeRankings,
      totalUsersVoting: totalVoters.length,
      totalStakedDrone: totalStaked._sum.stakeAmount || 0,
      nextResolutionIn: nextResolution
        ? Math.max(0, Math.floor((nextResolution.resolvesAt.getTime() - Date.now()) / 1000))
        : null,
    });
  } catch (error) {
    console.error('[RANKINGS] Health check failed:', error);
    return NextResponse.json(
      { status: 'degraded', error: 'Database connection issue' },
      { status: 500 }
    );
  }
}
