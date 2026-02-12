'use client';

import { useEffect, useState } from 'react';

interface ResolutionItem {
  rank: number;
  itemId: string;
  name: string;
  finalScore: number;
  rewardDistribution?: number;
}

interface UserVote {
  itemId: string;
  rank: number;
  stakeAmount: number;
}

interface ResolutionData {
  category: string;
  resolvedAt: number;
  finalRanking: ResolutionItem[];
  rewardStats?: {
    totalDroneDistributed: number;
    avgRewardPerVoter: number;
  };
}

interface ResolutionResultsProps {
  category: string;
  userAddress?: string;
}

export function ResolutionResults({ category, userAddress }: ResolutionResultsProps) {
  const [data, setData] = useState<ResolutionData | null>(null);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/rankings/${category}/resolved?week=1`).then((r) => r.json()),
      userAddress
        ? fetch(`/api/user/${userAddress}/votes?category=${category}`).then((r) => r.json())
        : Promise.resolve({ votes: [] }),
    ])
      .then(([resolutionData, userData]) => {
        setData(resolutionData);
        setUserVotes(userData.votes || []);
      })
      .catch((e) => console.error('Failed to load resolution data:', e))
      .finally(() => setLoading(false));
  }, [category, userAddress]);

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-gray-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.finalRanking || data.finalRanking.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
        <p>📊 No historical resolution data yet</p>
        <p className="text-xs mt-1">First resolution will be available after this week ends</p>
      </div>
    );
  }

  // Calculate user accuracy
  const userVoteMap = new Map(userVotes.map((v) => [v.itemId, v.rank]));
  let totalAccuracy = 0;
  let matchedCount = 0;
  let droneEarned = 0;

  data.finalRanking.forEach((item) => {
    const userRank = userVoteMap.get(item.itemId);
    if (userRank !== undefined) {
      const diff = Math.abs(userRank - item.rank);
      if (diff <= 1) {
        // Within ±1 rank = "close"
        matchedCount++;
        droneEarned += item.rewardDistribution || 0;
      }
      totalAccuracy += diff === 0 ? 100 : diff === 1 ? 80 : diff === 2 ? 60 : 0;
    }
  });

  const avgAccuracy = userVotes.length > 0 ? totalAccuracy / userVotes.length : 0;
  const hasVoted = userVotes.length > 0;

  if (!expanded) {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">📊 Last Week's Results</h3>
            <p className="text-sm text-gray-400">
              Resolved {new Date(data.resolvedAt * 1000).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="text-blue-400 hover:text-blue-300 font-semibold text-sm"
          >
            View Results →
          </button>
        </div>

        {hasVoted && (
          <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-gray-800/50 rounded-lg text-sm">
            <div>
              <div className="text-gray-500">Your Accuracy</div>
              <div className="text-green-400 font-bold">{avgAccuracy.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-gray-500">Close Predictions</div>
              <div className="text-orange-400 font-bold">{matchedCount}/{userVotes.length}</div>
            </div>
            <div>
              <div className="text-gray-500">DRONE Earned</div>
              <div className="text-purple-400 font-bold">{droneEarned.toFixed(0)}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">📊 Last Week's Resolution</h3>
          <p className="text-xs text-gray-500">
            Resolved on {new Date(data.resolvedAt * 1000).toLocaleDateString()} • Total rewards: {data.rewardStats?.totalDroneDistributed.toFixed(0) || 0} DRONE
          </p>
        </div>
        <button onClick={() => setExpanded(false)} className="text-gray-500 hover:text-gray-300 text-sm">
          Collapse
        </button>
      </div>

      {/* User Performance Summary */}
      {hasVoted && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-purple-300 mb-3">Your Performance</h4>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-gray-500">Accuracy</div>
              <div className={`text-lg font-bold ${avgAccuracy >= 80 ? 'text-green-400' : avgAccuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {avgAccuracy.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-gray-500">Close Votes</div>
              <div className="text-orange-400 font-bold">{matchedCount}/{userVotes.length}</div>
            </div>
            <div>
              <div className="text-gray-500">DRONE Earned</div>
              <div className="text-purple-400 font-bold">{droneEarned.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-gray-500">Reputation Gain</div>
              <div className="text-green-400 font-bold">+{Math.floor(avgAccuracy / 25)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Comparison */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Project</div>
          <div className="col-span-2 text-center">Final Score</div>
          <div className="col-span-2 text-center">Your Prediction</div>
          <div className="col-span-2 text-center">Accuracy</div>
          <div className="col-span-1 text-center">Reward</div>
        </div>

        {data.finalRanking.map((item) => {
          const userRank = userVoteMap.get(item.itemId);
          const diff = userRank !== undefined ? Math.abs(userRank - item.rank) : null;
          const isClose = diff !== null && diff <= 1;

          return (
            <div
              key={item.itemId}
              className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-lg ${
                isClose ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-800/30'
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                <span className="text-lg font-bold text-orange-400">#{item.rank}</span>
              </div>

              {/* Project */}
              <div className="col-span-4 flex items-center text-sm">
                <div className="font-semibold text-white">{item.name}</div>
              </div>

              {/* Final Score */}
              <div className="col-span-2 flex items-center justify-center text-sm font-bold text-white">
                {item.finalScore.toFixed(0)}
              </div>

              {/* User Prediction */}
              <div className="col-span-2 flex items-center justify-center text-sm">
                {userRank !== undefined ? (
                  <span className="font-bold text-purple-400">#{userRank}</span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </div>

              {/* Accuracy */}
              <div className="col-span-2 flex items-center justify-center text-sm">
                {diff !== null ? (
                  <span
                    className={`font-semibold ${
                      diff === 0 ? 'text-green-400' : diff === 1 ? 'text-yellow-400' : 'text-red-400'
                    }`}
                  >
                    {diff === 0 ? '✓ Exact' : diff === 1 ? '~ Close' : `✗ Off by ${diff}`}
                  </span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </div>

              {/* Reward */}
              <div className="col-span-1 flex items-center justify-center text-xs">
                {isClose && item.rewardDistribution ? (
                  <span className="text-purple-400 font-bold">+{item.rewardDistribution.toFixed(0)}</span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
