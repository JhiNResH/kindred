'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VotingItem {
  itemId: string;
  name: string;
  logoUrl: string | null;
  chain: string | null;
}

interface VotingPanelProps {
  category: string;
  items: VotingItem[];
  userAddress?: string;
  userReputation?: number;
  onSubmitVote: (votes: { itemId: string; rank: number; stakeAmount: number }[]) => Promise<void>;
}

export function VotingPanel({
  category,
  items,
  userAddress,
  userReputation = 30,
  onSubmitVote,
}: VotingPanelProps) {
  const [orderedItems, setOrderedItems] = useState<VotingItem[]>(items.slice(0, 10)); // Top 10
  const [stakeAmounts, setStakeAmounts] = useState<Record<string, number>>({});
  const [totalStake, setTotalStake] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...orderedItems];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrderedItems(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === orderedItems.length - 1) return;
    const newOrder = [...orderedItems];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrderedItems(newOrder);
  };

  const updateStake = (itemId: string, amount: number) => {
    const newStakes = { ...stakeAmounts, [itemId]: Math.max(0, amount) };
    setStakeAmounts(newStakes);
    const total = Object.values(newStakes).reduce((sum, val) => sum + val, 0);
    setTotalStake(total);
  };

  const handleSubmit = async () => {
    if (!userAddress) {
      alert('Please connect wallet first');
      return;
    }

    if (totalStake === 0) {
      alert('Please stake some Scarab on at least one item');
      return;
    }

    setSubmitting(true);

    try {
      const votes = orderedItems
        .map((item, index) => ({
          itemId: item.itemId,
          rank: index + 1,
          stakeAmount: stakeAmounts[item.itemId] || 0,
        }))
        .filter((v) => v.stakeAmount > 0); // Only submit voted items

      await onSubmitVote(votes);
      alert('✅ Vote submitted successfully!');
      setStakeAmounts({});
      setTotalStake(0);
    } catch (error) {
      console.error('Vote submission failed:', error);
      alert('❌ Vote failed: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const reputationMultiplier = 1 + Math.floor(userReputation / 50) * 0.5; // Simple multiplier
  const effectiveTotalStake = totalStake * reputationMultiplier;

  if (!expanded) {
    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">🗳️ Make Your Prediction</h3>
        <p className="text-sm text-gray-400 mb-4">
          Rank the top 10 projects and stake Scarab to boost your vote weight
        </p>
        <button
          onClick={() => setExpanded(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Start Voting
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">🗳️ Your Prediction</h3>
          <p className="text-xs text-gray-500">Drag to reorder, stake Scarab to boost your vote</p>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          Collapse
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-800/50 rounded-lg text-sm">
        <div>
          <div className="text-gray-500">Your Reputation</div>
          <div className="text-orange-400 font-bold">{userReputation}</div>
        </div>
        <div>
          <div className="text-gray-500">Total Stake</div>
          <div className="text-white font-bold">{totalStake.toFixed(0)} Scarab</div>
        </div>
        <div>
          <div className="text-gray-500">Effective Weight</div>
          <div className="text-green-400 font-bold">{effectiveTotalStake.toFixed(0)} ({reputationMultiplier.toFixed(1)}x)</div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-2 mb-4">
        {orderedItems.map((item, index) => (
          <div
            key={item.itemId}
            className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50 hover:border-orange-500/50 transition-colors"
          >
            {/* Rank */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={`p-1 rounded ${
                  index === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-orange-400'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold text-orange-400 min-w-[24px] text-center">#{index + 1}</span>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedItems.length - 1}
                className={`p-1 rounded ${
                  index === orderedItems.length - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-orange-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Project Info */}
            <div className="flex items-center gap-2 flex-1">
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                  {item.itemId.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-semibold text-white text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.itemId}</div>
              </div>
            </div>

            {/* Stake Input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={stakeAmounts[item.itemId] || ''}
                onChange={(e) => updateStake(item.itemId, parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <span className="text-xs text-gray-500">Scarab</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || totalStake === 0 || !userAddress}
        className={`w-full py-3 rounded-lg font-bold transition-colors ${
          submitting || totalStake === 0 || !userAddress
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {submitting ? '⏳ Submitting...' : totalStake === 0 ? '⚠️ Enter stake amounts' : `🚀 Submit Vote (${totalStake} Scarab)`}
      </button>

      {!userAddress && (
        <p className="text-xs text-red-400 mt-2 text-center">⚠️ Connect wallet to vote</p>
      )}
    </div>
  );
}
