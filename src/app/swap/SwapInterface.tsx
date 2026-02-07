'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowDown, Info, TrendingDown, Award, Shield, AlertCircle, ChevronDown, ArrowDownUp } from 'lucide-react'

// Fee calculation matching KindredHook.sol
const HIGH_TRUST_THRESHOLD = 850
const MEDIUM_TRUST_THRESHOLD = 600
const MIN_SCORE_TO_TRADE = 100

const FEE_HIGH_TRUST = 0.15    // 0.15%
const FEE_MEDIUM_TRUST = 0.22  // 0.22%
const FEE_LOW_TRUST = 0.30     // 0.30%

// Token definitions
interface Token {
  symbol: string
  name: string
  color: string
  icon: string
  decimals: number
  balance: string
}

const TOKENS: Record<string, Token> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    color: 'from-purple-500 to-blue-500',
    icon: 'Ξ',
    decimals: 18,
    balance: '0.5',
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    color: 'from-orange-500 to-yellow-500',
    icon: '₿',
    decimals: 8,
    balance: '0.025',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    color: 'from-green-500 to-emerald-500',
    icon: '$',
    decimals: 6,
    balance: '1,234.56',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    color: 'from-yellow-500 to-orange-500',
    icon: '◈',
    decimals: 18,
    balance: '987.65',
  },
}

// Mock exchange rates (vs USDC)
const EXCHANGE_RATES: Record<string, number> = {
  ETH: 2000,    // 1 ETH = 2000 USDC
  WBTC: 40000,  // 1 WBTC = 40000 USDC
  USDC: 1,      // 1 USDC = 1 USDC
  DAI: 1,       // 1 DAI = 1 USDC
}

function calculateFee(score: number): number {
  if (score >= HIGH_TRUST_THRESHOLD) return FEE_HIGH_TRUST
  if (score >= MEDIUM_TRUST_THRESHOLD) return FEE_MEDIUM_TRUST
  return FEE_LOW_TRUST
}

function getTrustTier(score: number): 'high' | 'medium' | 'low' | 'blocked' {
  if (score < MIN_SCORE_TO_TRADE) return 'blocked'
  if (score >= HIGH_TRUST_THRESHOLD) return 'high'
  if (score >= MEDIUM_TRUST_THRESHOLD) return 'medium'
  return 'low'
}

function calculateSwapOutput(
  fromToken: string,
  toToken: string,
  amount: number,
  feePercent: number
): number {
  const fromRate = EXCHANGE_RATES[fromToken]
  const toRate = EXCHANGE_RATES[toToken]
  
  // Convert to USDC, apply fee, then convert to target token
  const usdcValue = amount * fromRate
  const afterFee = usdcValue * (1 - feePercent / 100)
  const output = afterFee / toRate
  
  return output
}

// Token Selector Component
function TokenSelector({ 
  selectedToken, 
  onSelect,
  exclude 
}: { 
  selectedToken: string
  onSelect: (token: string) => void
  exclude?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const token = TOKENS[selectedToken]

  const availableTokens = Object.entries(TOKENS).filter(
    ([symbol]) => symbol !== exclude
  )

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
      >
        <div className={`w-6 h-6 bg-gradient-to-br ${token.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
          {token.icon}
        </div>
        <span className="font-semibold">{token.symbol}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 min-w-[200px]">
            {availableTokens.map(([symbol, t]) => (
              <button
                key={symbol}
                onClick={() => {
                  onSelect(symbol)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {t.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{t.symbol}</div>
                  <div className="text-xs text-gray-400">{t.name}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function SwapInterface() {
  const { address, isConnected } = useAccount()
  const [reputation, setReputation] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState('1.0')
  const [toAmount, setToAmount] = useState('0.0')

  // Fetch user reputation
  useEffect(() => {
    if (!address) {
      setReputation(null)
      return
    }

    async function fetchReputation() {
      setLoading(true)
      try {
        // Fetch real reputation from ReputationOracle contract
        const response = await fetch('/api/reputation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        })

        if (response.ok) {
          const data = await response.json()
          setReputation(data.score || 0)
          console.log('[Swap] Reputation fetched:', data.score)
        } else {
          console.warn('[Swap] Reputation fetch failed, using fallback')
          setReputation(0)
        }
      } catch (error) {
        console.error('[Swap] Failed to fetch reputation:', error)
        setReputation(0) // Default fallback
      } finally {
        setLoading(false)
      }
    }

    fetchReputation()
  }, [address])

  // Calculate swap output
  useEffect(() => {
    const input = parseFloat(fromAmount) || 0
    if (input > 0 && reputation !== null) {
      const fee = calculateFee(reputation)
      const output = calculateSwapOutput(fromToken, toToken, input, fee)
      
      // Format based on token decimals
      const decimals = TOKENS[toToken].decimals >= 6 ? 2 : 6
      setToAmount(output.toFixed(decimals))
    } else {
      setToAmount('0.0')
    }
  }, [fromAmount, fromToken, toToken, reputation])

  // Handle token flip
  const handleFlip = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount('0.0')
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Connect Wallet to Swap</h2>
          <p className="text-gray-400 mb-8">
            Connect your wallet to see your reputation and start trading with dynamic fees
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  const fee = reputation !== null ? calculateFee(reputation) : FEE_LOW_TRUST
  const trustTier = reputation !== null ? getTrustTier(reputation) : 'low'
  const canTrade = reputation !== null && reputation >= MIN_SCORE_TO_TRADE

  return (
    <div className="max-w-2xl mx-auto">
      {/* Reputation Card */}
      <div className="mb-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">Your Reputation</div>
              <div className="text-3xl font-bold text-purple-300">
                {loading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : reputation !== null ? (
                  `${reputation} / 1000`
                ) : (
                  '---'
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400">Your Fee</div>
            <div className="text-3xl font-bold text-green-400">{fee}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {trustTier === 'high' && '⭐ High Trust'}
              {trustTier === 'medium' && '🌟 Medium Trust'}
              {trustTier === 'low' && '⚡ Low Trust'}
              {trustTier === 'blocked' && '🚫 Blocked'}
            </div>
          </div>
        </div>

        {/* Reputation Progress Bar */}
        {reputation !== null && (
          <div className="mt-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  trustTier === 'high' ? 'bg-green-500' :
                  trustTier === 'medium' ? 'bg-blue-500' :
                  trustTier === 'low' ? 'bg-gray-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(reputation / 1000) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 (Blocked)</span>
              <span>600 (Medium)</span>
              <span>850 (High)</span>
              <span>1000 (Max)</span>
            </div>
          </div>
        )}
      </div>

      {/* Swap Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Swap Tokens</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingDown className="w-4 h-4" />
            <span>Dynamic Fee: {fee}%</span>
          </div>
        </div>

        {/* From Token */}
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-2">From</label>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-2xl font-semibold outline-none w-full"
                disabled={!canTrade}
              />
              <TokenSelector 
                selectedToken={fromToken} 
                onSelect={setFromToken}
                exclude={toToken}
              />
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Balance: {TOKENS[fromToken].balance} {fromToken}
            </div>
          </div>
        </div>

        {/* Swap Icon with Flip Button */}
        <div className="flex justify-center my-4">
          <button
            onClick={handleFlip}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 transition-all hover:scale-110"
            disabled={!canTrade}
          >
            <ArrowDownUp className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">To (estimated)</label>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
              <TokenSelector 
                selectedToken={toToken} 
                onSelect={setToToken}
                exclude={fromToken}
              />
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Balance: {TOKENS[toToken].balance} {toToken}
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        {canTrade && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-semibold text-blue-300 mb-1">Dynamic Fee Applied</div>
                <div className="text-gray-400">
                  Your reputation score of <strong>{reputation}</strong> qualifies you for a{' '}
                  <strong className="text-green-400">{fee}%</strong> swap fee.
                  {trustTier === 'high' && " You're saving 50% compared to standard fees!"}
                  {trustTier === 'medium' && " You're saving 27% compared to standard fees!"}
                  {trustTier === 'low' && " Build reputation to unlock lower fees!"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        {canTrade ? (
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all"
          >
            Swap {fromToken} → {toToken} via KindredHook
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="font-semibold text-red-300 mb-1">Trading Blocked</div>
            <div className="text-sm text-gray-400">
              Reputation score must be at least {MIN_SCORE_TO_TRADE} to trade. 
              Current: {reputation || 0}
            </div>
            <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition">
              Build Reputation →
            </button>
          </div>
        )}

        {/* Contract Info */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <div>KindredHook (Base Sepolia)</div>
          <div className="font-mono mt-1">0x... (coming soon)</div>
        </div>
      </div>
    </div>
  )
}
