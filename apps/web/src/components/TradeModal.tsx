'use client'

import { useState } from 'react'
import { X, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'

interface TradeModalProps {
  market: {
    id: string
    question: string
    outcomes: { name: string; price: number }[]
  }
  side: 'yes' | 'no'
  isOpen: boolean
  onClose: () => void
  onSuccess?: (position: any) => void
}

export function TradeModal({ market, side, isOpen, onClose, onSuccess }: TradeModalProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const price = side === 'yes' 
    ? market.outcomes[0]?.price || 0.5 
    : market.outcomes[1]?.price || 0.5
  
  const shares = amount ? parseFloat(amount) / price : 0
  const potentialPayout = shares * 1 // If wins, each share pays $1
  const potentialProfit = potentialPayout - parseFloat(amount || '0')

  const handleTrade = async () => {
    if (!address || !amount) return
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          marketId: market.id,
          marketQuestion: market.question,
          outcome: side,
          shares: shares.toFixed(2),
          avgPrice: price,
          currentPrice: price,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create position')
      }

      const position = await response.json()
      onSuccess?.(position)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trade failed')
    } finally {
      setIsLoading(false)
    }
  }

  const isYes = side === 'yes'
  const colorClass = isYes ? 'green' : 'red'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#111113] border border-[#1f1f23] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1f1f23]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isYes ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {isYes ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">Buy {isYes ? 'Yes' : 'No'}</h3>
              <p className="text-xs text-[#6b6b70]">{(price * 100).toFixed(1)}¢ per share</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#6b6b70] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Market Question */}
          <p className="text-sm text-[#adadb0] mb-4 line-clamp-2">
            {market.question}
          </p>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm text-[#6b6b70] mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b70]">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 bg-[#0a0a0b] border border-[#1f1f23] rounded-lg text-white text-lg focus:border-purple-500 outline-none transition-colors"
              />
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2 mt-2">
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="flex-1 py-1.5 bg-[#1f1f23] rounded text-xs text-[#adadb0] hover:bg-[#2a2a2e] hover:text-white transition-colors"
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 bg-[#0a0a0b] rounded-lg mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b70]">Shares</span>
                <span>{shares.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b70]">Avg Price</span>
                <span>{(price * 100).toFixed(1)}¢</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b70]">Potential Payout</span>
                <span className={isYes ? 'text-green-500' : 'text-red-500'}>
                  ${potentialPayout.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#1f1f23]">
                <span className="text-[#6b6b70]">Potential Profit</span>
                <span className={isYes ? 'text-green-500' : 'text-red-500'}>
                  +${potentialProfit.toFixed(2)} ({((potentialProfit / parseFloat(amount)) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-[#6b6b70] mb-4">
            This is a demo. No real funds will be used. Positions are stored locally.
          </p>

          {/* Submit Button */}
          <button
            onClick={handleTrade}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isYes 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              `Buy ${isYes ? 'Yes' : 'No'} for $${amount || '0'}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TradeModal
