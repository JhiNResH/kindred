/**
 * Weekly Resolution Engine for Opinion Markets
 * 
 * Core flow:
 * 1. Find all rankings past their resolvesAt time
 * 2. Calculate final rankings from stake-weighted votes
 * 3. Score each voter's accuracy (distance from final rank)
 * 4. Distribute DRONE rewards proportional to accuracy × stake
 * 5. Update user reputation scores
 * 6. Create OpinionResolution record
 * 7. Spawn next week's ranking round
 */

import { prisma } from './prisma';

// ISO week string: "2026-W07"
function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// DRONE reward pool per ranking resolution
const BASE_REWARD_POOL = 500; // DRONE per ranking
const ACCURACY_THRESHOLD = 0.5; // Minimum accuracy to earn rewards
const REP_GAIN_PER_ACCURATE = 5; // Rep points for accurate prediction
const REP_LOSS_PER_INACCURATE = 2; // Rep points lost for bad prediction

interface ResolutionResult {
  rankingId: string;
  category: string;
  week: string;
  itemsResolved: number;
  votersRewarded: number;
  totalDroneDistributed: number;
  nextRankingCreated: boolean;
}

/**
 * Resolve a single ranking: score voters, distribute DRONE, update rep
 */
async function resolveRanking(rankingId: string): Promise<ResolutionResult> {
  const ranking = await prisma.opinionRanking.findUnique({
    where: { id: rankingId },
    include: {
      items: { include: { votes: true }, orderBy: { currentScore: 'desc' } },
    },
  });

  if (!ranking) throw new Error(`Ranking ${rankingId} not found`);

  const week = getISOWeek(ranking.resolvesAt);

  // Step 1: Finalize item rankings (current scores become final)
  const finalRankings: { itemId: string; name: string; finalRank: number; finalScore: number }[] = [];

  for (let i = 0; i < ranking.items.length; i++) {
    const item = ranking.items[i];
    const finalRank = i + 1;
    const finalScore = item.currentScore;

    finalRankings.push({
      itemId: item.itemId,
      name: item.name,
      finalRank,
      finalScore,
    });

    await prisma.opinionItem.update({
      where: { id: item.id },
      data: { finalRank, finalScore },
    });
  }

  // Step 2: Score each voter's accuracy
  // Accuracy = 1 - |predictedRank - finalRank| / totalItems
  // Capped at [0, 1]
  const totalItems = ranking.items.length;
  const allVotes = ranking.items.flatMap((item) =>
    item.votes.map((vote) => ({
      ...vote,
      finalRank: finalRankings.find((r) => r.itemId === item.itemId)?.finalRank || totalItems,
    }))
  );

  // Group votes by voter
  const voterVotes = new Map<string, typeof allVotes>();
  for (const vote of allVotes) {
    const existing = voterVotes.get(vote.voterAddress) || [];
    existing.push(vote);
    voterVotes.set(vote.voterAddress, existing);
  }

  // Step 3: Calculate rewards
  // Reward = (accuracy * stakeAmount) / totalWeightedAccuracy * REWARD_POOL
  type VoterScore = {
    address: string;
    avgAccuracy: number;
    totalStake: number;
    weightedScore: number;
    votes: typeof allVotes;
  };

  const voterScores: VoterScore[] = [];
  let totalWeightedScore = 0;

  for (const [address, votes] of voterVotes) {
    // Average accuracy across all items voted on
    const accuracies = votes.map((v) => {
      const distance = Math.abs(v.rankedPosition - v.finalRank);
      return Math.max(0, 1 - distance / totalItems);
    });
    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const totalStake = votes.reduce((sum, v) => sum + v.stakeAmount, 0);
    const weightedScore = avgAccuracy * totalStake;

    voterScores.push({ address, avgAccuracy, totalStake, weightedScore, votes });
    if (avgAccuracy >= ACCURACY_THRESHOLD) {
      totalWeightedScore += weightedScore;
    }
  }

  // Step 4: Distribute DRONE + update votes + update reputation
  let totalDistributed = 0;
  let votersRewarded = 0;

  for (const scorer of voterScores) {
    let droneReward = 0;

    if (scorer.avgAccuracy >= ACCURACY_THRESHOLD && totalWeightedScore > 0) {
      droneReward = Math.round((scorer.weightedScore / totalWeightedScore) * BASE_REWARD_POOL);
      votersRewarded++;
    }

    totalDistributed += droneReward;

    // Update each vote with accuracy + reward
    const rewardPerVote = scorer.votes.length > 0 ? droneReward / scorer.votes.length : 0;
    for (const vote of scorer.votes) {
      const distance = Math.abs(vote.rankedPosition - vote.finalRank);
      const accuracy = Math.max(0, 1 - distance / totalItems);

      await prisma.opinionVote.update({
        where: { id: vote.id },
        data: {
          accuracy: Math.round(accuracy * 1000) / 1000,
          rewardEarned: Math.round(rewardPerVote * 100) / 100,
        },
      });
    }

    // Update user DRONE balance + reputation
    const repChange = scorer.avgAccuracy >= ACCURACY_THRESHOLD
      ? REP_GAIN_PER_ACCURATE
      : -REP_LOSS_PER_INACCURATE;

    const user = await prisma.user.findUnique({
      where: { address: scorer.address },
    });

    if (user) {
      const newRep = Math.max(0, Math.min(100, user.reputationScore + repChange));

      // Determine fee tier from reputation
      let feeTier = 'normal';
      if (newRep >= 80) feeTier = 'elite';
      else if (newRep >= 60) feeTier = 'trusted';
      else if (newRep < 20) feeTier = 'risky';

      await prisma.user.update({
        where: { address: scorer.address },
        data: {
          droneBalance: { increment: droneReward },
          reputationScore: newRep,
          feeTier,
        },
      });
    }
  }

  // Step 5: Create resolution record
  await prisma.opinionResolution.create({
    data: {
      rankingId: ranking.id,
      week,
      finalRankings: JSON.stringify(finalRankings),
      totalDroneDistributed: totalDistributed,
      totalVotersRewarded: votersRewarded,
      avgRewardPerVoter: votersRewarded > 0 ? totalDistributed / votersRewarded : 0,
    },
  });

  // Step 6: Mark ranking as resolved
  await prisma.opinionRanking.update({
    where: { id: ranking.id },
    data: {
      isActive: false,
      resolvedAt: new Date(),
    },
  });

  // Step 7: Spawn next week's ranking
  const nextResolvesAt = new Date(ranking.resolvesAt);
  nextResolvesAt.setDate(nextResolvesAt.getDate() + 7);

  let nextRankingCreated = false;

  // Check if next week's ranking already exists
  const existingNext = await prisma.opinionRanking.findFirst({
    where: {
      category: ranking.category,
      resolvesAt: { gte: ranking.resolvesAt },
      isActive: true,
    },
  });

  if (!existingNext) {
    const newRanking = await prisma.opinionRanking.create({
      data: {
        category: ranking.category,
        title: ranking.title, // Same title, new week
        description: ranking.description,
        resolvesAt: nextResolvesAt,
        isActive: true,
      },
    });

    // Copy items to next ranking (reset scores)
    for (const item of ranking.items) {
      await prisma.opinionItem.create({
        data: {
          rankingId: newRanking.id,
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          logoUrl: item.logoUrl,
          chain: item.chain,
          currentScore: 50, // Reset
          currentRank: 0,
          stakeWeightedVotes: 0,
          voterCount: 0,
          consensus: 'weak',
        },
      });
    }

    nextRankingCreated = true;
  }

  return {
    rankingId: ranking.id,
    category: ranking.category,
    week,
    itemsResolved: finalRankings.length,
    votersRewarded,
    totalDroneDistributed: totalDistributed,
    nextRankingCreated,
  };
}

/**
 * Main entry: resolve all expired rankings
 */
export async function resolveExpiredRankings(): Promise<ResolutionResult[]> {
  const now = new Date();

  const expiredRankings = await prisma.opinionRanking.findMany({
    where: {
      isActive: true,
      resolvesAt: { lte: now },
      resolvedAt: null,
    },
  });

  if (expiredRankings.length === 0) {
    return [];
  }

  const results: ResolutionResult[] = [];

  for (const ranking of expiredRankings) {
    try {
      const result = await resolveRanking(ranking.id);
      results.push(result);
      console.log(`[RESOLUTION] ✅ Resolved ${ranking.category} (${result.week}): ${result.votersRewarded} voters, ${result.totalDroneDistributed} DRONE`);
    } catch (error) {
      console.error(`[RESOLUTION] ❌ Failed to resolve ${ranking.category}:`, error);
    }
  }

  return results;
}

/**
 * Preview resolution without committing (dry run)
 */
export async function previewResolution(rankingId: string) {
  const ranking = await prisma.opinionRanking.findUnique({
    where: { id: rankingId },
    include: {
      items: { include: { votes: true }, orderBy: { currentScore: 'desc' } },
    },
  });

  if (!ranking) return null;

  const totalItems = ranking.items.length;
  const projectedRankings = ranking.items.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    score: item.currentScore,
    voterCount: item.voterCount,
    consensus: item.consensus,
  }));

  // Calculate projected voter rewards
  const allVotes = ranking.items.flatMap((item, i) =>
    item.votes.map((v) => ({
      address: v.voterAddress,
      predicted: v.rankedPosition,
      projected: i + 1,
      stake: v.stakeAmount,
    }))
  );

  const voterMap = new Map<string, { totalAccuracy: number; count: number; totalStake: number }>();
  for (const v of allVotes) {
    const existing = voterMap.get(v.address) || { totalAccuracy: 0, count: 0, totalStake: 0 };
    const accuracy = Math.max(0, 1 - Math.abs(v.predicted - v.projected) / totalItems);
    existing.totalAccuracy += accuracy;
    existing.count++;
    existing.totalStake += v.stake;
    voterMap.set(v.address, existing);
  }

  const voterPreviews = Array.from(voterMap.entries()).map(([address, data]) => ({
    address,
    avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
    totalStake: data.totalStake,
    eligible: (data.totalAccuracy / data.count) >= ACCURACY_THRESHOLD,
  }));

  return {
    category: ranking.category,
    resolvesAt: ranking.resolvesAt,
    projectedRankings,
    voterPreviews,
    rewardPool: BASE_REWARD_POOL,
    totalVoters: voterPreviews.length,
    eligibleVoters: voterPreviews.filter((v) => v.eligible).length,
  };
}
