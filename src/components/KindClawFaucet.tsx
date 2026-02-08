'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Droplet, Clock, Check, Loader2 } from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'

const KINDCLAW = CONTRACTS.baseSepolia.kindClaw

export function KindClawFaucet() {
  const { address, isConnected } = useAccount()
  const [timeLeft, setTimeLeft] = useState(0)
  
  // Check if can claim
  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: KINDCLAW.address,
    abi: KINDCLAW.abi,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  })
  
  // Get time until next claim
  const { data: timeUntil } = useReadContract({
    address: KINDCLAW.address,
    abi: KINDCLAW.abi,
    functionName: 'timeUntilNextClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 1000,
    },
  })
  
  // Claim faucet
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  
  useEffect(() => {
    if (timeUntil) {
      setTimeLeft(Number(timeUntil))
    }
  }, [timeUntil])
  
  const handleClaim = () => {
    writeContract({
      address: KINDCLAW.address,
      abi: KINDCLAW.abi,
      functionName: 'claimFaucet',
    })
  }
  
  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'Ready!'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }
  
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplet className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">KINDCLAW Faucet</div>
              <div className="text-2xl font-bold text-purple-300">100 Free Tokens</div>
            </div>
          </div>
        </div>
        <ConnectButton />
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">KINDCLAW Faucet</div>
            <div className="text-2xl font-bold text-purple-300">100 Tokens</div>
          </div>
        </div>
        
        {timeLeft > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
      
      {isSuccess && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-green-300">100 KINDCLAW claimed successfully!</span>
        </div>
      )}
      
      {isError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <span className="text-red-300 text-sm">
            {error?.message || 'Failed to claim'}
          </span>
        </div>
      )}
      
      <button
        onClick={handleClaim}
        disabled={!canClaim || isPending || isConfirming}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {isPending && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Waiting for approval...
          </>
        )}
        {isConfirming && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirming...
          </>
        )}
        {!isPending && !isConfirming && canClaim && (
          <>
            <Droplet className="w-5 h-5" />
            Claim 100 KINDCLAW
          </>
        )}
        {!isPending && !isConfirming && !canClaim && (
          <>
            <Clock className="w-5 h-5" />
            Cooldown active ({formatTime(timeLeft)})
          </>
        )}
      </button>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Claim once per hour • Testnet only • Free for Clawathon
      </div>
    </div>
  )
}
