'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { useIsMounted } from './ClientOnly'

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

export function MyPredictions() {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPredictions() {
      if (!address) return
      try {
        const res = await fetch(`/api/predictions?address=${address}`)
        const data = await res.json()
        setPredictions(data.predictions || [])
      } catch (error) {
        console.error('Failed to fetch predictions:', error)
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }
    if (isConnected && address) {
      fetchPredictions()
    } else {
      setLoading(false)
    }
  }, [address, isConnected])

  // Prevent SSR hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-kindred-dark border border-gray-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-bold mb-2">Your Predictions</h3>
        <p className="text-gray-400 mb-4">Connect wallet to view your predictions</p>
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </div>
    )
  }

  const pendingPredictions = predictions.filter(p => p.status === 'pending')
  const pastPredictions = predictions.filter(p => p.status !== 'pending')

  const totalStaked = predictions.reduce((sum, p) => sum + Number(p.stakeAmount), 0)
  const totalWon = predictions
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
            <div className="text-lg font-bold text-white">{predictions.length}</div>
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
      {predictions.length === 0 && (
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
