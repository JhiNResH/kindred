'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Bot, Shield, Zap, Gift, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'

export default function AgentPage() {
  const { address, isConnected } = useAccount()
  const [reputation, setReputation] = useState<number | null>(null)
  const [isAgent, setIsAgent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Fetch agent status and reputation
  useEffect(() => {
    if (!address) return

    const fetchStatus = async () => {
      setLoading(true)
      try {
        // Fetch reputation
        const repRes = await fetch(`/api/reputation?address=${address}`)
        const repData = await repRes.json()
        setReputation(repData.score || 0)

        // Check if already registered as agent
        // In production, query contract: hook.isAgent(address)
        setIsAgent(false) // Default for now
      } catch (error) {
        console.error('Failed to fetch status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [address])

  const handleRegister = async () => {
    if (!address) return

    writeContract({
      address: CONTRACTS.baseSepolia.kindredHookV2.address,
      abi: CONTRACTS.baseSepolia.kindredHookV2.abi,
      functionName: 'registerAgent',
      args: [address],
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-xl">
            <Bot className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">AI Agent Registration</h2>
            <p className="text-slate-400 mb-8">
              Connect your wallet to register as an AI agent and unlock special trading benefits
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Agent Registration
            <span className="ml-3 px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-lg">
              MaatHookV2
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Register as an AI agent to get lower reputation requirements and priority MEV protection
          </p>
        </div>

        {/* Status Card */}
        {isAgent ? (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Agent Status: Active</h3>
                <p className="text-green-300">
                  You're registered as an AI agent with special trading benefits
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Not Registered</h3>
                <p className="text-slate-300">Register to unlock AI agent benefits</p>
              </div>
              <button
                onClick={handleRegister}
                disabled={isPending || isConfirming}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isPending ? 'Confirming...' : 'Registering...'}
                  </span>
                ) : (
                  'Register as Agent'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {hash && (
          <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              {isConfirming && (
                <>
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-slate-300">Confirming registration...</span>
                </>
              )}
              {isSuccess && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Registration successful!</span>
                </>
              )}
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View on Basescan
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Lower Reputation Requirement */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Lower Requirements</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Standard Minimum:</span>
                <span className="text-white font-medium">100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Agent Minimum:</span>
                <span className="text-green-400 font-bold">300</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Your Reputation:</span>
                <span className={`font-bold ${
                  reputation !== null && reputation >= 300 ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {loading ? '...' : reputation}
                </span>
              </div>
            </div>
          </div>

          {/* Auto Reputation Boost */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Auto Reputation Boost</h3>
            <p className="text-sm text-slate-300 mb-3">
              If your reputation is below 300, you'll automatically receive a boost to the minimum requirement upon registration.
            </p>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300">
                ✨ Instant boost to 300 reputation if you're below threshold
              </p>
            </div>
          </div>

          {/* Priority MEV Protection */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Priority MEV Protection</h3>
            <p className="text-sm text-slate-300 mb-3">
              Same priority execution as high-reputation human users. Your trades are protected from sandwich attacks.
            </p>
            <div className="space-y-1 text-xs text-slate-400">
              <div>• Reputation 300-599: Priority 1 (Delayed MEV protection)</div>
              <div>• Reputation 600-849: Priority 2 (Normal execution)</div>
              <div>• Reputation 850+: Priority 3 (Immediate execution)</div>
            </div>
          </div>

          {/* Referral Earnings */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Earn via Referrals</h3>
            <p className="text-sm text-slate-300 mb-3">
              Once you reach 700 reputation, you can refer users and earn 20% of their swap fees.
            </p>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-xs text-orange-300">
                💰 Build reputation → Refer users → Earn passive income
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-xl">
          <div className="flex gap-3">
            <Bot className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What is an AI Agent?</h3>
              <p className="text-sm text-slate-300 mb-3">
                AI agents are autonomous trading programs that need lower barriers to participate in DeFi. 
                Maat's Agent Registration system gives agents the same MEV protection and economic opportunities 
                as human users, while maintaining security through reputation requirements.
              </p>
              <p className="text-sm text-blue-300">
                Perfect for: Trading bots, AI assistants, automated market makers, and autonomous agents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
