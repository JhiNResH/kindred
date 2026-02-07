'use client'

import { useState } from 'react'
import { useSmartAccount } from '@/hooks/useSmartAccount'
import { Shield, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { type Address } from 'viem'

interface AgentDelegationProps {
  agentAddress: Address
  agentName: string
  className?: string
}

export function AgentDelegation({ agentAddress, agentName, className = '' }: AgentDelegationProps) {
  const { delegation, createAgentDelegation, revokeAgentDelegation, isLoading, smartAccount } = useSmartAccount()
  const [maxAmount, setMaxAmount] = useState('10') // Default 10 USDC
  const [showConfig, setShowConfig] = useState(false)

  const handleDelegate = async () => {
    try {
      await createAgentDelegation(agentAddress, maxAmount)
    } catch (error) {
      console.error('Delegation error:', error)
    }
  }

  const handleRevoke = async () => {
    if (confirm(`Revoke delegation to ${agentName}?`)) {
      await revokeAgentDelegation()
    }
  }

  if (!smartAccount) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Agent Delegation</h3>
        </div>
        <p className="text-sm text-gray-400">
          Connect your wallet to enable agent delegation
        </p>
      </div>
    )
  }

  if (delegation) {
    return (
      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Agent Authorized</h3>
              <p className="text-sm text-gray-400">{agentName} can act on your behalf</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Agent</div>
              <div className="font-mono text-white">{agentName}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Max Amount</div>
              <div className="font-medium text-white">${maxAmount} USDC</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Token</div>
              <div className="text-white">USDC</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Network</div>
              <div className="text-white">Base Sepolia</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleRevoke}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span>Revoke Delegation</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">Delegate to Agent</h3>
          <p className="text-sm text-gray-400">
            Authorize <span className="text-white font-semibold">{agentName}</span> to perform actions with your USDC within a set limit
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Benefits</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Agent can unlock content automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>No need to approve every transaction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Full control - revoke anytime</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Limited to USDC transfers only</span>
            </li>
          </ul>
        </div>

        {showConfig && (
          <div className="bg-black/20 rounded-lg p-4">
            <label className="text-sm font-medium text-white mb-2 block">
              Maximum Amount (USDC)
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="1000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
              placeholder="10"
            />
            <p className="text-xs text-gray-400 mt-2">
              Agent can spend up to ${maxAmount} USDC on your behalf
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {!showConfig && (
          <button
            onClick={() => setShowConfig(true)}
            className="w-full px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg transition text-sm"
          >
            Configure Amount
          </button>
        )}

        <button
          onClick={handleDelegate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Delegation...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Authorize Agent (${maxAmount} USDC)</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Smart contract delegation - secure and revocable
        </p>
      </div>
    </div>
  )
}
