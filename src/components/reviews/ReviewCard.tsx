import { useState, useEffect } from 'react'
import { Coins, Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { useUpvote, useDownvote } from '@/hooks/useMaatComment'
import { useApproveKindToken, useKindTokenAllowance, useKindTokenBalance } from '@/hooks/useKindToken'
import { parseEther, formatEther } from 'viem'
import { useAccount } from 'wagmi'

interface Review {
  id: string
  targetAddress: string
  targetName: string
  reviewerAddress: string
  rating: number
  content: string
  category: string
  predictedRank: number | null
  stakeAmount: string
  photoUrls: string[]
  upvotes: number
  downvotes: number
  createdAt: string
  nftTokenId?: string // ERC-721 token ID from MaatComment contract
}

interface ReviewCardProps {
  review: Review
}

const CATEGORY_ICONS: Record<string, string> = {
  'k/memecoin': '🐸',
  'k/defi': '🏦',
  'k/perp-dex': '📈',
  'k/ai': '🤖',
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { address, isConnected } = useAccount()
  const [voteAmount, setVoteAmount] = useState('0.1') // Default 0.1 KIND
  const [showVoteInput, setShowVoteInput] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  
  // Contract hooks
  const { upvote, isPending: isUpvoting, isConfirming: isUpvoteConfirming } = useUpvote()
  const { downvote, isPending: isDownvoting, isConfirming: isDownvoteConfirming } = useDownvote()
  const { approve, isPending: isApproving, isConfirming: isApproveConfirming } = useApproveKindToken()
  
  // Balance and allowance queries
  const { data: balance } = useKindTokenBalance(address)
  const { data: allowance, refetch: refetchAllowance } = useKindTokenAllowance(address)
  
  const stakeValue = review.stakeAmount ? Number(review.stakeAmount.toString().replace(/,/g, '')) : 0
  const truncateAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Anon'
  const netScore = review.upvotes - review.downvotes
  
  // Check if approval is needed when vote amount changes
  useEffect(() => {
    if (!allowance || !voteAmount) {
      setNeedsApproval(false)
      return
    }
    
    try {
      const amountWei = parseEther(voteAmount)
      const currentAllowance = BigInt(allowance.toString())
      setNeedsApproval(currentAllowance < amountWei)
    } catch (error) {
      console.error('Error checking allowance:', error)
      setNeedsApproval(false)
    }
  }, [allowance, voteAmount])
  
  const handleApprove = async () => {
    try {
      const amountWei = parseEther(voteAmount)
      await approve(amountWei.toString())
      
      // Wait a bit and refetch allowance
      setTimeout(() => {
        refetchAllowance()
      }, 2000)
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Approval failed. Please try again.')
    }
  }
  
  const handleUpvote = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!review.nftTokenId) {
      alert('This review has not been minted as NFT yet. Cannot vote.')
      return
    }
    
    if (needsApproval) {
      alert('Please approve KIND token spending first')
      return
    }
    
    // Check balance
    if (balance) {
      const balanceBigInt = balance as bigint
      const amountWei = parseEther(voteAmount)
      if (balanceBigInt < amountWei) {
        alert(`Insufficient KIND balance. You have ${formatEther(balanceBigInt)} KIND`)
        return
      }
    }
    
    try {
      const amount = parseEther(voteAmount)
      await upvote(BigInt(review.nftTokenId), amount)
      
      // Update database vote count
      await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: 'up', amount: voteAmount }),
      })
      
      setShowVoteInput(false)
      // TODO: Refresh review data or use optimistic update
    } catch (error) {
      console.error('Upvote failed:', error)
      alert('Upvote failed. Please try again.')
    }
  }
  
  const handleDownvote = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!review.nftTokenId) {
      alert('This review has not been minted as NFT yet. Cannot vote.')
      return
    }
    
    if (needsApproval) {
      alert('Please approve KIND token spending first')
      return
    }
    
    // Check balance
    if (balance) {
      const balanceBigInt = balance as bigint
      const amountWei = parseEther(voteAmount)
      if (balanceBigInt < amountWei) {
        alert(`Insufficient KIND balance. You have ${formatEther(balanceBigInt)} KIND`)
        return
      }
    }
    
    try {
      const amount = parseEther(voteAmount)
      await downvote(BigInt(review.nftTokenId), amount)
      
      // Update database vote count
      await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: 'down', amount: voteAmount }),
      })
      
      setShowVoteInput(false)
      // TODO: Refresh review data or use optimistic update
    } catch (error) {
      console.error('Downvote failed:', error)
      alert('Downvote failed. Please try again.')
    }
  }
  
  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 hover:border-kindred-primary/50 transition relative overflow-hidden group">
      {/* ERC404 Background Indicator */}
      {stakeValue > 0 && (
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
          <Coins className="w-24 h-24 text-kindred-primary" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-kindred-primary to-purple-800 rounded-full flex items-center justify-center text-lg text-white font-bold">
            {review.reviewerAddress?.slice(0, 2).toUpperCase() || 'AN'}
          </div>
          <div>
            <div className="font-mono text-sm text-[#d9d4e8]">{truncateAddress(review.reviewerAddress)}</div>
            <div className="text-xs text-gray-500">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-700'}>
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Target */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="text-lg">{review.category ? CATEGORY_ICONS[review.category] : '📄'}</span>
        <span className="text-sm text-gray-400">Reviewing:</span>
        <code className="text-xs bg-gray-900 border border-gray-700 px-2 py-1 rounded font-mono capitalize text-purple-300">
          {review.targetName}
        </code>
      </div>

      {/* Content */}
      <p className="text-[#d9d4e8]/80 mb-4 line-clamp-3 relative z-10 leading-relaxed">{review.content}</p>

      {/* Vote Input (Expandable) */}
      {showVoteInput && (
        <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg relative z-10">
          <label className="text-sm text-gray-400 mb-2 block">Stake Amount (KIND)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={voteAmount}
            onChange={(e) => setVoteAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="0.1"
          />
          
          {/* Balance Display */}
          {typeof balance === 'bigint' && (
            <div className="text-xs text-gray-400 mt-1">
              Balance: {formatEther(balance)} KIND
            </div>
          )}
          
          {/* Approval Warning */}
          {needsApproval && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div className="text-xs text-yellow-400">
                You need to approve KIND token spending before voting
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-3">
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || isApproveConfirming}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {isApproving || isApproveConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4" />
                )}
                <span>Approve KIND</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpvote}
                  disabled={isUpvoting || isUpvoteConfirming}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                  {isUpvoting || isUpvoteConfirming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>Upvote</span>
                </button>
                <button
                  onClick={handleDownvote}
                  disabled={isDownvoting || isDownvoteConfirming}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                  {isDownvoting || isDownvoteConfirming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>Downvote</span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowVoteInput(false)}
              className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer / Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800 relative z-10">
        <div className="flex items-center gap-4">
          {/* Upvote Button */}
          <button 
            onClick={() => setShowVoteInput(!showVoteInput)}
            disabled={!review.nftTokenId || isUpvoting || isDownvoting}
            className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition group/vote disabled:opacity-50 disabled:cursor-not-allowed"
            title={review.nftTokenId ? "Stake & Vote" : "Review not minted yet"}
          >
            <span className={netScore > 0 ? 'text-green-400' : ''}>▲</span>
            <span className="text-sm font-bold group-hover/vote:text-green-400 transition-colors">
              {netScore}
            </span>
          </button>
          
          {/* Comment Placeholder */}
          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition">
            <span>💬</span>
            <span className="text-sm">0</span>
          </button>
        </div>

        {/* Stake Badge */}
        {stakeValue > 0 && (
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 text-kindred-primary bg-purple-900/20 px-2 py-1 rounded border border-purple-500/20">
                 <Coins className="w-3.5 h-3.5" />
                 <span className="text-xs font-semibold">{stakeValue} $KIND Staked</span>
             </div>
          </div>
        )}
        
        {/* NFT Token ID Badge (for debugging) */}
        {review.nftTokenId && (
          <div className="text-xs text-gray-500 font-mono">
            Token #{review.nftTokenId}
          </div>
        )}
      </div>
    </div>
  )
}
