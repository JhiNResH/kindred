'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface RankingItem {
  rank: number;
  itemId: string;
  name: string;
  logoUrl: string | null;
  chain: string | null;
  credibilityScore: number;
  stakeWeightedVotes: number;
  totalVoters: number;
  consensus: string;
}

interface RankingData {
  category: string;
  title: string;
  currentRanking: RankingItem[];
  metadata: {
    lastUpdatedAt: number;
    nextResolutionAt: number;
    totalStaked: number;
    totalVoters: number;
    daysUntilResolution: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  'memecoin-credibility': '💎 Memecoin Credibility',
  'perp-risk': '📊 Perp DEX Reliability',
  'agent-experts': '🤖 Agent Experts',
};

const CONSENSUS_COLORS: Record<string, string> = {
  strong: 'text-green-400',
  moderate: 'text-yellow-400',
  weak: 'text-red-400',
};

export default function RankingPage() {
  const params = useParams();
  const category = params.category as string;
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rankings/${category}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch rankings');
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-400">
          {error || 'No ranking found'}
        </h2>
        <p className="text-gray-400 mt-2">Category: {category}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-1">
          {CATEGORY_LABELS[category] || category}
        </div>
        <h1 className="text-3xl font-bold text-white">{data.title}</h1>
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>📊 {data.metadata.totalVoters} voters</span>
          <span>💰 {data.metadata.totalStaked.toLocaleString()} DRONE staked</span>
          <span>⏰ {data.metadata.daysUntilResolution} days until resolution</span>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-800/50 text-xs text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Project</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">Voters</div>
          <div className="col-span-2 text-right">Stake Weight</div>
          <div className="col-span-1 text-right">Signal</div>
        </div>

        {data.currentRanking.map((item) => (
          <div
            key={item.itemId}
            className="grid grid-cols-12 gap-2 px-4 py-4 border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors"
          >
            {/* Rank */}
            <div className="col-span-1 flex items-center">
              <span
                className={`text-lg font-bold ${
                  item.rank <= 3 ? 'text-orange-400' : 'text-gray-500'
                }`}
              >
                #{item.rank}
              </span>
            </div>

            {/* Project Info */}
            <div className="col-span-4 flex items-center gap-3">
              {item.logoUrl ? (
                <img
                  src={item.logoUrl}
                  alt={item.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                  {item.itemId.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-xs text-gray-500">
                  {item.itemId} · {item.chain || 'multi'}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="col-span-2 flex items-center justify-end">
              <div
                className={`text-lg font-bold ${
                  item.credibilityScore >= 80
                    ? 'text-green-400'
                    : item.credibilityScore >= 60
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {item.credibilityScore}
              </div>
            </div>

            {/* Voters */}
            <div className="col-span-2 flex items-center justify-end text-gray-300">
              {item.totalVoters}
            </div>

            {/* Stake Weight */}
            <div className="col-span-2 flex items-center justify-end text-gray-300">
              {item.stakeWeightedVotes.toLocaleString()}
            </div>

            {/* Consensus */}
            <div className="col-span-1 flex items-center justify-end">
              <span
                className={`text-xs font-medium ${
                  CONSENSUS_COLORS[item.consensus] || 'text-gray-500'
                }`}
              >
                {item.consensus}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Vote CTA */}
      <div className="mt-8 text-center">
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          🗳️ Stake & Vote on Rankings
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Stake DRONE to vote. Higher reputation = more vote weight.
        </p>
      </div>
    </div>
  );
}
