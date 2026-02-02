'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface Prediction {
  id: string
  projectName: string
  projectIcon: string
  category: string
  predictedRank: number
  actualRank: number | null
  stakeAmount: string
  status: 'pending' | 'won' | 'lost' | 'partial'
  potentialWin: string
  createdAt: string
  settlesAt: string
}

// Mock data
const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: '1',
    projectName: 'Hyperliquid',
    projectIcon: '💎',
    category: 'k/perp-dex',
    predictedRank: 1,
    actualRank: null,
    stakeAmount: '500000000000000000000',
    status: 'pending',
    potentialWin: '1500000000000000000000',
    createdAt: '2025-01-28T10:00:00Z',
    settlesAt: '2025-02-02T00:00:00Z',
  },
  {
    id: '2',
    projectName: 'PEPE',
    projectIcon: '🐸',
    category: 'k/memecoin',
    predictedRank: 1,
    actualRank: 1,
    stakeAmount: '1000000000000000000000',
    status: 'won',
    potentialWin: '3000000000000000000000',
    createdAt: '2025-01-21T10:00:00Z',
    settlesAt: '2025-01-28T00:00:00Z',
  },
  {
    id: '3',
    projectName: 'AI16Z',
    projectIcon: '🤖',
    category: 'k/ai',
    predictedRank: 2,
    actualRank: 4,
    stakeAmount: '200000000000000000000',
    status: 'lost',
    potentialWin: '500000000000000000000',
    createdAt: '2025-01-21T10:00:00Z',
    settlesAt: '2025-01-28T00:00:00Z',
  },
]

export function MyPredictions() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="bg-kindred-dark border border-gray-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-bold mb-2">Your Predictions</h3>
        <p className="text-gray-400 mb-4">Connect wallet to view your predictions</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    )
  }

  const pendingPredictions = MOCK_PREDICTIONS.filter(p => p.status === 'pending')
  const pastPredictions = MOCK_PREDICTIONS.filter(p => p.status !== 'pending')

  const totalStaked = MOCK_PREDICTIONS.reduce((sum, p) => sum + Number(p.stakeAmount), 0)
  const totalWon = MOCK_PREDICTIONS
    .filter(p => p.status === 'won')
    .reduce((sum, p) => sum + Number(p.potentialWin), 0)
  const winRate = pastPredictions.length > 0
    ? (pastPredictions.filter(p => p.status === 'won').length / pastPredictions.length * 100).toFixed(0)
    : 0

  const getStatusBadge = (status: Prediction['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">⏳ Pending</span>
      case 'won':
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">✅ Won</span>
      case 'lost':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">❌ Lost</span>
      case 'partial':
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">🎯 Partial</span>
    }
  }

  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold mb-4">📊 My Predictions</h2>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{MOCK_PREDICTIONS.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">{pendingPredictions.length}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{winRate}%</div>
            <div className="text-xs text-gray-500">Win Rate</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">+{(totalWon / 1e18).toFixed(0)}</div>
            <div className="text-xs text-gray-500">OPEN Won</div>
          </div>
        </div>
      </div>

      {/* Pending Predictions */}
      {pendingPredictions.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Active Predictions</h3>
          <div className="space-y-3">
            {pendingPredictions.map((pred) => (
              <div key={pred.id} className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pred.projectIcon}</span>
                  <div>
                    <div className="font-semibold">{pred.projectName}</div>
                    <div className="text-xs text-gray-500">
                      Predicted #{pred.predictedRank} • {(Number(pred.stakeAmount) / 1e18).toFixed(0)} OPEN
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(pred.status)}
                  <div className="text-xs text-gray-500 mt-1">
                    Settles {new Date(pred.settlesAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Predictions */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">History</h3>
        <div className="space-y-2">
          {pastPredictions.map((pred) => (
            <div key={pred.id} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{pred.projectIcon}</span>
                <div>
                  <div className="font-medium text-sm">{pred.projectName}</div>
                  <div className="text-xs text-gray-500">
                    Predicted #{pred.predictedRank} → Actual #{pred.actualRank}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(pred.status)}
                <div className={`text-sm font-mono mt-1 ${
                  pred.status === 'won' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pred.status === 'won' ? '+' : '-'}{(Number(pred.stakeAmount) / 1e18).toFixed(0)} OPEN
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {MOCK_PREDICTIONS.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-400">No predictions yet</p>
          <a href="/stake" className="text-kindred-primary hover:underline text-sm">
            Make your first prediction →
          </a>
        </div>
      )}
    </div>
  )
}
