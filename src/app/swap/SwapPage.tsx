'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ArrowDownUp, TrendingDown, Award, Info, Zap } from 'lucide-react'

// Fee tiers based on reputation (basis points, 10000 = 100%)
const FEE_TIERS = {
  elite: { fee: 5, minReputation: 1000, label: 'Elite', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  trusted: { fee: 10, minReputation: 500, label: 'Trusted', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  normal: { fee: 30, minReputation: 0, label: 'Normal', color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
  risky: { fee: 100, minReputation: -100, label: 'Risky', color: 'text-red-400', bgColor: 'bg-red-500/10' },
}

const STANDARD_FEE = 30 // 0.30% (Uniswap v3 standard)

export function SwapPage() {
  const { authenticated, user, login } = usePrivy()
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [fromToken, setFromToken] = useState('USDC')
  const [toToken, setToToken] = useState('OPEN')
  const [userReputation, setUserReputation] = useState(0)
  const [isSwapping, setIsSwapping] = useState(false)

  // Mock reputation fetch (TODO: Replace with real API call)
  useEffect(() => {
    if (authenticated && user) {
      // Simulate fetching user reputation
      // In production, fetch from /api/user/reputation
      setUserReputation(750) // Demo: Trusted tier
    }
  }, [authenticated, user])

  // Calculate fee tier based on reputation
  const getFeeTier = (reputation: number) => {
    if (reputation >= FEE_TIERS.elite.minReputation) return FEE_TIERS.elite
    if (reputation >= FEE_TIERS.trusted.minReputation) return FEE_TIERS.trusted
    if (reputation >= FEE_TIERS.normal.minReputation) return FEE_TIERS.normal
    return FEE_TIERS.risky
  }

  const feeTier = getFeeTier(userReputation)
  const feePercentage = feeTier.fee / 100 // Convert basis points to percentage
  const standardFeePercentage = STANDARD_FEE / 100
  const savings = standardFeePercentage - feePercentage

  // Calculate output amount (with fee)
  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const amount = Number(fromAmount)
      const fee = amount * (feeTier.fee / 10000)
      const output = amount - fee
      setToAmount(output.toFixed(6))
    } else {
      setToAmount('')
    }
  }, [fromAmount, feeTier])

  const handleSwap = async () => {
    if (!authenticated) {
      login()
      return
    }

    setIsSwapping(true)
    try {
      // TODO: Implement actual swap via KindredHook
      console.log('Swapping:', fromAmount, fromToken, '→', toToken)
      console.log('Fee tier:', feeTier.label, `(${feePercentage}%)`)
      
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate transaction
      
      alert('Swap successful! (Demo only)')
      setFromAmount('')
      setToAmount('')
    } catch (error) {
      console.error('Swap failed:', error)
      alert('Swap failed. Please try again.')
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white pt-8">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Kindred Hook Swap</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
            Trade with Dynamic Fees
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Your community reputation earns you lower trading fees via Uniswap v4 Hooks
          </p>
        </div>

        {/* Reputation Card */}
        {authenticated ? (
          <div className={`${feeTier.bgColor} border border-${feeTier.color.replace('text-', '')}/20 rounded-2xl p-6 mb-8`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className={`w-6 h-6 ${feeTier.color}`} />
                <div>
                  <h3 className="text-lg font-bold">Your Fee Tier: {feeTier.label}</h3>
                  <p className="text-sm text-gray-400">Reputation: {userReputation.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${feeTier.color}`}>{feePercentage}%</div>
                <p className="text-xs text-gray-500">Trading fee</p>
              </div>
            </div>

            {savings > 0 && (
              <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg px-3 py-2">
                <TrendingDown className="w-4 h-4" />
                <span>You save {savings.toFixed(2)}% compared to standard {standardFeePercentage}% fee!</span>
              </div>
            )}

            {savings < 0 && (
              <div className="flex items-center gap-2 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-3 py-2">
                <Info className="w-4 h-4" />
                <span>Build reputation to unlock lower fees! Write reviews and stake $OPEN.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8 text-center">
            <p className="text-gray-400 mb-4">Connect your wallet to see your fee tier</p>
            <button
              onClick={login}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Swap Interface */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Swap Tokens</h2>

          {/* From */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">Balance: 100.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-3xl font-bold outline-none"
              />
              <div className="bg-gray-700 rounded-lg px-4 py-2 font-semibold">
                {fromToken}
              </div>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-gray-900 border-4 border-gray-800 rounded-xl p-2 hover:border-purple-500 transition cursor-pointer">
              <ArrowDownUp className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          {/* To */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-sm text-gray-400">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-3xl font-bold outline-none text-gray-500"
              />
              <div className="bg-gray-700 rounded-lg px-4 py-2 font-semibold">
                {toToken}
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          {fromAmount && authenticated && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Rate</span>
                <span>1 {fromToken} = 1 {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fee ({feeTier.label})</span>
                <span className={feeTier.color}>{feePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fee Amount</span>
                <span>{(Number(fromAmount) * feeTier.fee / 10000).toFixed(6)} {fromToken}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                <span>You receive</span>
                <span>{toAmount} {toToken}</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!fromAmount || isSwapping || !authenticated}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition"
          >
            {!authenticated ? 'Connect Wallet' : isSwapping ? 'Swapping...' : 'Swap'}
          </button>
        </div>

        {/* Fee Tiers Info */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">How Dynamic Fees Work</h3>
          <div className="space-y-3">
            {Object.entries(FEE_TIERS).map(([key, tier]) => (
              <div key={key} className={`${tier.bgColor} border border-gray-700 rounded-lg p-3 flex items-center justify-between`}>
                <div>
                  <span className={`font-semibold ${tier.color}`}>{tier.label}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    {tier.minReputation >= 0 ? `${tier.minReputation}+` : tier.minReputation} reputation
                  </span>
                </div>
                <div className={`text-xl font-bold ${tier.color}`}>
                  {tier.fee / 100}%
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Build reputation by writing high-quality reviews, staking $OPEN, and participating in the community.
          </p>
        </div>
      </div>
    </main>
  )
}
