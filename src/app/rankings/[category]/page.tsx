'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { CountdownTimer } from '@/components/CountdownTimer';
import { VotingPanel } from '@/components/VotingPanel';
import { ResolutionResults } from '@/components/ResolutionResults';

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

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'memecoin-credibility': 'Stake-weighted consensus ranking of the most credible memecoins. Higher rank = lower risk.',
  'perp-risk': 'Community-ranked perpetual DEXs by reliability, liquidity depth, and execution quality.',
  'agent-experts': 'Vote on the most accurate autonomous agents. Reputation-based expert discovery.',
};

const CONSENSUS_COLORS: Record<string, string> = {
  strong: 'text-green-400',
  moderate: 'text-yellow-400',
  weak: 'text-red-400',
};

export default function RankingPage() {
  const params = useParams();
  const category = params.category as string;
  const { address } = useAccount();
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rankings' | 'vote' | 'history'>('rankings');

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

  const handleVoteSubmit = async (votes: { itemId: string; rank: number; stakeAmount: number }[]) => {
    if (!address) throw new Error('Wallet not connected');

    const res = await fetch(`/api/rankings/${category}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, votes }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Vote submission failed');
    }

    // Refresh data after vote
    const updated = await fetch(`/api/rankings/${category}`).then((r) => r.json());
    setData(updated);
  };

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
        <h2 className="text-2xl font-bold text-red-400">{error || 'No ranking found'}</h2>
        <p className="text-gray-400 mt-2">Category: {category}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">{CATEGORY_LABELS[category] || category}</div>
        <h1 className="text-4xl font-bold text-white mb-2">{data.title}</h1>
        <p className="text-gray-400 text-sm max-w-2xl">{CATEGORY_DESCRIPTIONS[category]}</p>
      </div>

      {/* Stats + Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Stats Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Market Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Voters</div>
              <div className="text-2xl font-bold text-white">{data.metadata.totalVoters}</div>
            </div>
            <div>
              <div className="text-gray-500">Total Staked</div>
              <div className="text-2xl font-bold text-orange-400">
                {data.metadata.totalStaked.toLocaleString()}
                <span className="text-sm text-gray-500 ml-1">Scarab</span>
              </div>
            </div>
            <div>
              <div className="text-gray-500">Last Updated</div>
              <div className="text-sm text-gray-300">
                {new Date(data.metadata.lastUpdatedAt * 1000).toLocaleTimeString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Items Ranked</div>
              <div className="text-sm text-white font-bold">{data.currentRanking.length}</div>
            </div>
          </div>
        </div>

        {/* Countdown Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex items-center justify-center">
          <CountdownTimer targetTimestamp={data.metadata.nextResolutionAt} label="⏰ Next Resolution" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('rankings')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'rankings'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          📊 Current Rankings
        </button>
        <button
          onClick={() => setActiveTab('vote')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'vote'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          🗳️ Make Prediction
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'history'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          📈 Last Week's Results
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'rankings' && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-800/50 text-xs text-gray-400 uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Project</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right">Voters</div>
            <div className="col-span-2 text-right">Stake Weight</div>
            <div className="col-span-1 text-right">Signal</div>
          </div>

          {/* Table Rows */}
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
                  <img src={item.logoUrl} alt={item.name} className="w-8 h-8 rounded-full" />
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
      )}

      {activeTab === 'vote' && (
        <VotingPanel
          category={category}
          items={data.currentRanking.map((item) => ({
            itemId: item.itemId,
            name: item.name,
            logoUrl: item.logoUrl,
            chain: item.chain,
          }))}
          userAddress={address}
          userReputation={50} // TODO: Fetch from user API
          onSubmitVote={handleVoteSubmit}
        />
      )}

      {activeTab === 'history' && <ResolutionResults category={category} userAddress={address} />}
    </div>
  );
}
