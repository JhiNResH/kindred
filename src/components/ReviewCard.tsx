'use client'

import { useVote } from '@/hooks/useVote'

interface ReviewCardProps {
  review: {
    id: string
    targetAddress: string
    reviewerAddress: string
    rating: number
    content: string
    category: string
    stakeAmount: string
    upvotes: number
    downvotes: number
    createdAt: string
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  'k/memecoin': '🐸',
  'k/defi': '🏦',
  'k/perp-dex': '📈',
  'k/ai': '🤖',
  // Legacy support
  protocol: '⚡',
  token: '🪙',
  nft: '🖼️',
  product: '📦',
  service: '🛠️',
}

export function ReviewCard({ review, interactive = false }: ReviewCardProps & { interactive?: boolean }) {
  const { upvotes, downvotes, userVote, voting, vote } = useVote({
    reviewId: review.id,
    initialUpvotes: review.upvotes,
    initialDownvotes: review.downvotes,
  })

  const stakeInEth = Number(review.stakeAmount) / 1e18
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  
  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-kindred-primary to-orange-600 rounded-full flex items-center justify-center text-lg">
            {review.reviewerAddress.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div className="font-mono text-sm">{truncateAddress(review.reviewerAddress)}</div>
            <div className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
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
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{CATEGORY_ICONS[review.category] || '📄'}</span>
        <span className="text-sm text-gray-400">Reviewing:</span>
        <code className="text-xs bg-gray-900 px-2 py-1 rounded font-mono">
          {truncateAddress(review.targetAddress)}
        </code>
        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full capitalize">
          {review.category}
        </span>
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-4 line-clamp-3">{review.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          {interactive ? (
            // Interactive mode: Full voting buttons (for project detail pages)
            <>
              <button 
                onClick={() => vote('up')}
                disabled={voting || userVote === 'up'}
                className={`flex items-center gap-1 transition ${
                  userVote === 'up' 
                    ? 'text-green-400' 
                    : 'text-gray-400 hover:text-green-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>👍</span>
                <span className="text-sm font-medium">{upvotes}</span>
              </button>
              <button 
                onClick={() => vote('down')}
                disabled={voting || userVote === 'down'}
                className={`flex items-center gap-1 transition ${
                  userVote === 'down' 
                    ? 'text-red-400' 
                    : 'text-gray-400 hover:text-red-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>👎</span>
                <span className="text-sm font-medium">{downvotes}</span>
              </button>
            </>
          ) : (
            // Read-only mode: Display only (for feed pages)
            <>
              <div className="flex items-center gap-1 text-gray-500 cursor-default">
                <span>👍</span>
                <span className="text-sm font-medium">{upvotes}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 cursor-default">
                <span>👎</span>
                <span className="text-sm font-medium">{downvotes}</span>
              </div>
              <span className="text-xs text-gray-600 ml-2">→ Click to vote</span>
            </>
          )}
        </div>
        {stakeInEth > 0 && (
          <div className="flex items-center gap-1 text-kindred-primary">
            <span>💰</span>
            <span className="text-sm font-semibold">{stakeInEth} OPEN staked</span>
          </div>
        )}
      </div>
    </div>
  )
}
