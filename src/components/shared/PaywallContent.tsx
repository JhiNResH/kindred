'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Coins, Eye, Users, TrendingUp, Wallet } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useIsMounted } from '@/components/layout/ClientOnly'
import { useX402 } from '@/hooks/useX402'

interface PaywallContentProps {
  reviewId: string
  previewContent: string // Free preview
  fullContent?: string // Full content (if unlocked)
  unlockPrice: string // in ETH
  author: string
  authorEarnings: string // How much author has earned
  totalUnlocks: number
  isUnlocked?: boolean
  onUnlock?: () => void
}

export function PaywallContent({
  reviewId,
  previewContent,
  fullContent,
  unlockPrice,
  author,
  authorEarnings,
  totalUnlocks,
  isUnlocked: initialUnlocked = false,
  onUnlock
}: PaywallContentProps) {
  const isMounted = useIsMounted()
  const { isConnected } = useAccount()
  const { 
    isLoading, 
    isUnlocked: x402Unlocked, 
    content: unlockedContent,
    requirements,
    error,
    checkAccess, 
    payOnChain,
    formatPrice,
    getAssetSymbol,
  } = useX402(reviewId, 'review')
  
  const [showFullContent, setShowFullContent] = useState(initialUnlocked)

  // Check access on mount
  useEffect(() => {
    if (isMounted && !initialUnlocked) {
      checkAccess()
    }
  }, [isMounted, initialUnlocked, checkAccess])

  // Update state when x402 unlocks
  useEffect(() => {
    if (x402Unlocked) {
      setShowFullContent(true)
      onUnlock?.()
    }
  }, [x402Unlocked, onUnlock])

  const handleUnlock = async () => {
    if (!isConnected) {
      // TODO: Prompt wallet connection modal
      alert('Please connect your wallet first')
      return
    }

    const result = await payOnChain()
    if (result.success) {
      setShowFullContent(true)
    }
  }

  if (!isMounted) {
    return (
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6 animate-pulse">
        <div className="h-24 bg-[#1f1f23] rounded mb-4"></div>
        <div className="h-12 bg-[#1f1f23] rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
      {/* Content Area */}
      <div className="p-6">
        {/* Preview Content */}
        <p className="text-[#adadb0] leading-relaxed">
          {previewContent}
        </p>

        {/* Paywall or Full Content */}
        {showFullContent && fullContent ? (
          <>
            <div className="my-4 border-t border-dashed border-purple-500/30" />
            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-700" />
              <p className="text-white leading-relaxed">
                {fullContent}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-purple-400">
              <Unlock className="w-3 h-3" />
              Premium content unlocked
            </div>
          </>
        ) : (
          <div className="mt-6">
            {/* Blur Effect */}
            <div className="relative">
              <div className="text-[#adadb0] leading-relaxed blur-sm select-none pointer-events-none">
                This is premium content that requires payment to access. The author has shared valuable insights about the project's tokenomics, security considerations, and future roadmap analysis. Early supporters who unlock this content may benefit from...
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#111113] via-[#111113]/80 to-transparent">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Premium Analysis</h4>
                  <p className="text-sm text-[#6b6b70] mb-4">
                    Unlock the full review to access deep insights
                  </p>
                  
                  {/* Stats */}
                  <div className="flex justify-center gap-6 mb-4 text-xs">
                    <div className="flex items-center gap-1 text-[#6b6b70]">
                      <Eye className="w-3 h-3" />
                      <span>{totalUnlocks} unlocked</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <Coins className="w-3 h-3" />
                      <span>{authorEarnings} ETH earned</span>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <p className="text-red-400 text-sm mb-3">{error}</p>
                  )}

                  <button
                    onClick={handleUnlock}
                    disabled={isLoading || !isConnected}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-medium hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Processing...
                      </span>
                    ) : !isConnected ? (
                      <span className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Unlock className="w-4 h-4" />
                        Unlock for {requirements ? `${formatPrice()} ${getAssetSymbol()}` : `${unlockPrice} ETH`}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-3 bg-[#0a0a0b] border-t border-[#1f1f23] flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[#6b6b70]">
            <Users className="w-3 h-3" />
            <span>by {author.slice(0, 6)}...{author.slice(-4)}</span>
          </div>
          <div className="flex items-center gap-1 text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>{authorEarnings} ETH total earnings</span>
          </div>
        </div>
        <div className="text-[#6b6b70]">
          {totalUnlocks} readers
        </div>
      </div>
    </div>
  )
}
