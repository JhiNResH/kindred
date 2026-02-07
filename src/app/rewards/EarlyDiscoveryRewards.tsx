'use client'

import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { Sparkles, TrendingUp, DollarSign, Calendar } from 'lucide-react'

// Mock data for demo
const MOCK_DISCOVERIES = [
  {
    project: 'Uniswap',
    discoveredAt: new Date('2026-01-15'),
    yourVoteRank: 2, // You were 2nd to upvote
    currentRank: 1,
    stakeAmount: '10',
    earnedFromUnlocks: '45.50', // USDC from x402 unlocks
    earnedFromVotes: '12.30', // Share from later votes
    totalEarned: '57.80',
  },
  {
    project: 'Aave',
    discoveredAt: new Date('2026-01-20'),
    yourVoteRank: 1, // You were FIRST!
    currentRank: 2,
    stakeAmount: '25',
    earnedFromUnlocks: '89.20',
    earnedFromVotes: '34.50',
    totalEarned: '123.70',
  },
  {
    project: 'Curve',
    discoveredAt: new Date('2026-02-01'),
    yourVoteRank: 5,
    currentRank: 4,
    stakeAmount: '5',
    earnedFromUnlocks: '12.30',
    earnedFromVotes: '5.80',
    totalEarned: '18.10',
  },
]

export function EarlyDiscoveryRewards() {
  const { isConnected } = useAccount()

  const totalEarned = MOCK_DISCOVERIES.reduce((sum, d) => sum + parseFloat(d.totalEarned), 0).toFixed(2)
  const totalFromUnlocks = MOCK_DISCOVERIES.reduce((sum, d) => sum + parseFloat(d.earnedFromUnlocks), 0).toFixed(2)
  const totalFromVotes = MOCK_DISCOVERIES.reduce((sum, d) => sum + parseFloat(d.earnedFromVotes), 0).toFixed(2)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Early Discovery Rewards</h1>
            <p className="text-gray-400 mb-8">
              Track your earnings from discovering great projects early
            </p>
            <WalletButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold">Early Discovery Rewards</h1>
          </div>
          <p className="text-gray-400 text-lg">
            You earn when projects you upvoted early succeed. The earlier you spot winners, the more you earn!
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
            <DollarSign className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-3xl font-bold mb-1">${totalEarned}</div>
            <div className="text-sm text-gray-400">Total Earned</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-3xl font-bold mb-1">{MOCK_DISCOVERIES.length}</div>
            <div className="text-sm text-gray-400">Early Discoveries</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
            <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
            <div className="text-3xl font-bold mb-1">
              {MOCK_DISCOVERIES.filter(d => d.yourVoteRank <= 3).length}
            </div>
            <div className="text-sm text-gray-400">Top 3 Spots</div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Earnings by Source</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg">
                <div>
                  <div className="font-semibold text-blue-300">x402 Unlocks</div>
                  <div className="text-sm text-gray-400">20% of unlock fees</div>
                </div>
                <div className="text-2xl font-bold text-blue-400">${totalFromUnlocks}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg">
                <div>
                  <div className="font-semibold text-purple-300">Vote Fees</div>
                  <div className="text-sm text-gray-400">Share from later voters</div>
                </div>
                <div className="text-2xl font-bold text-purple-400">${totalFromVotes}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">🏆 How It Works</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">1.</span>
                <span>Upvote projects early (within first week)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">2.</span>
                <span>When users unlock premium content (x402), early voters get 20% of fees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">3.</span>
                <span>Later upvotes also share fees with early voters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">4.</span>
                <span>The earlier you vote, the bigger your share!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Discovery List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Early Discoveries</h2>
          <div className="space-y-4">
            {MOCK_DISCOVERIES.map((discovery, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{discovery.project}</h3>
                      {discovery.yourVoteRank === 1 && (
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                          🥇 FIRST!
                        </span>
                      )}
                      {discovery.yourVoteRank === 2 && (
                        <span className="bg-gray-500/20 text-gray-300 text-xs font-bold px-2 py-1 rounded">
                          🥈 2nd
                        </span>
                      )}
                      {discovery.yourVoteRank === 3 && (
                        <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded">
                          🥉 3rd
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {discovery.discoveredAt.toLocaleDateString()}
                      </div>
                      <div>Current Rank: #{discovery.currentRank}</div>
                      <div>Staked: {discovery.stakeAmount} KIND</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">
                      ${discovery.totalEarned}
                    </div>
                    <div className="text-sm text-gray-400">Total Earned</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">From Unlocks</div>
                    <div className="text-lg font-bold text-blue-400">
                      ${discovery.earnedFromUnlocks}
                    </div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">From Votes</div>
                    <div className="text-lg font-bold text-purple-400">
                      ${discovery.earnedFromVotes}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Find the Next Big Thing</h3>
          <p className="text-gray-400 mb-6">
            Browse projects and upvote early to maximize your rewards
          </p>
          <a
            href="/k/defi"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Explore Projects
          </a>
        </div>
      </div>
    </div>
  )
}
