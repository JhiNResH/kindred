import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/rankings/[category]/vote — Submit a ranking vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    const body = await request.json();
    const { address, votes } = body;

    if (!address || !votes || !Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: address, votes[]' },
        { status: 400 }
      );
    }

    // Find active ranking
    const ranking = await prisma.opinionRanking.findFirst({
      where: { category, isActive: true },
    });

    if (!ranking) {
      return NextResponse.json(
        { error: `No active ranking found for category: ${category}` },
        { status: 404 }
      );
    }

    // Check if ranking is still open
    if (ranking.resolvesAt < new Date()) {
      return NextResponse.json(
        { error: 'This ranking round has closed' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({ where: { address: address.toLowerCase() } });
    if (!user) {
      user = await prisma.user.create({
        data: { address: address.toLowerCase() },
      });
    }

    const userReputation = user.reputationScore || 30;
    const tier = Math.min(6, Math.max(1, Math.floor(userReputation / 15)));
    const weightMultiplier = (userReputation / 50) * (1 + tier / 10);

    // Validate votes: no duplicate ranks
    const ranks = votes.map((v: { rank: number }) => v.rank);
    if (new Set(ranks).size !== ranks.length) {
      return NextResponse.json(
        { error: 'Duplicate rank positions not allowed' },
        { status: 400 }
      );
    }

    // Process each vote
    const results = [];
    let totalStaked = 0;

    for (const vote of votes) {
      const { itemId, rank, stakeAmount = 10 } = vote;

      // Find or validate item
      const item = await prisma.opinionItem.findUnique({
        where: { rankingId_itemId: { rankingId: ranking.id, itemId } },
      });

      if (!item) {
        results.push({ itemId, status: 'error', message: 'Item not found' });
        continue;
      }

      const effectiveWeight = stakeAmount * weightMultiplier;

      // Upsert vote
      const upsertedVote = await prisma.opinionVote.upsert({
        where: {
          rankingId_itemId_voterAddress: {
            rankingId: ranking.id,
            itemId: item.id,
            voterAddress: address.toLowerCase(),
          },
        },
        update: {
          rankedPosition: rank,
          stakeAmount,
          voterReputation: userReputation,
          effectiveWeight,
        },
        create: {
          rankingId: ranking.id,
          itemId: item.id,
          voterAddress: address.toLowerCase(),
          isAgent: false,
          rankedPosition: rank,
          stakeAmount,
          voterReputation: userReputation,
          effectiveWeight,
        },
      });

      totalStaked += stakeAmount;
      results.push({ itemId, status: 'ok', voteId: upsertedVote.id, effectiveWeight });
    }

    // Update ranking aggregate stats
    const allVotes = await prisma.opinionVote.findMany({
      where: { rankingId: ranking.id },
    });
    const uniqueVoters = new Set(allVotes.map((v) => v.voterAddress)).size;
    const totalStakedAll = allVotes.reduce((sum, v) => sum + v.stakeAmount, 0);

    await prisma.opinionRanking.update({
      where: { id: ranking.id },
      data: {
        totalVoters: uniqueVoters,
        totalStaked: totalStakedAll,
      },
    });

    // Recalculate item scores
    await recalculateRankingScores(ranking.id);

    // Award +10 DRONE for voting
    await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: {
        droneBalance: { increment: 10 }
      }
    });

    return NextResponse.json({
      success: true,
      votes: results,
      userReputation,
      weightMultiplier: Math.round(weightMultiplier * 100) / 100,
      totalStaked,
      nextResolutionAt: ranking.resolvesAt.getTime(),
      droneEarned: 10,
    });
  } catch (error) {
    console.error('[RANKINGS] Error voting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Recalculate all item scores for a ranking
async function recalculateRankingScores(rankingId: string) {
  const items = await prisma.opinionItem.findMany({
    where: { rankingId },
    include: { votes: true },
  });

  const updates = items.map((item) => {
    const votes = item.votes;
    if (votes.length === 0) {
      return prisma.opinionItem.update({
        where: { id: item.id },
        data: { currentScore: 50, currentRank: 0, stakeWeightedVotes: 0, voterCount: 0, consensus: 'weak' },
      });
    }

    // Calculate stake-weighted average rank position
    const totalWeight = votes.reduce((sum, v) => sum + v.effectiveWeight, 0);
    const weightedRankSum = votes.reduce(
      (sum, v) => sum + v.rankedPosition * v.effectiveWeight,
      0
    );
    const avgWeightedRank = weightedRankSum / totalWeight;

    // Convert to score (rank 1 = 100, rank 10 = 10)
    const score = Math.max(0, Math.min(100, 110 - avgWeightedRank * 10));

    // Calculate consensus strength
    const rankStdDev = Math.sqrt(
      votes.reduce((sum, v) => sum + Math.pow(v.rankedPosition - avgWeightedRank, 2), 0) / votes.length
    );
    const consensus = rankStdDev < 1.5 ? 'strong' : rankStdDev < 3 ? 'moderate' : 'weak';

    return prisma.opinionItem.update({
      where: { id: item.id },
      data: {
        currentScore: Math.round(score * 10) / 10,
        stakeWeightedVotes: Math.round(totalWeight * 100) / 100,
        voterCount: votes.length,
        consensus,
      },
    });
  });

  await Promise.all(updates);

  // Update ranks (sorted by currentScore desc)
  const updatedItems = await prisma.opinionItem.findMany({
    where: { rankingId },
    orderBy: { currentScore: 'desc' },
  });

  await Promise.all(
    updatedItems.map((item, index) =>
      prisma.opinionItem.update({
        where: { id: item.id },
        data: { currentRank: index + 1 },
      })
    )
  );
}
