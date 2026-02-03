'use client'

import { useState } from 'react'
import { MessageSquare, Share2, Bookmark, MoreHorizontal, Award, ExternalLink } from 'lucide-react'
import { VoteButtons } from './VoteButtons'

interface PostCardProps {
  id: string
  project: string
  projectIcon?: string
  category: string
  rating: number
  author: string
  authorReputation?: number
  content: string
  upvotes: number
  comments: number
  staked: string
  timestamp: string
  isNFT?: boolean
  nftPrice?: string
}

export function PostCard({
  id,
  project,
  projectIcon = '🔷',
  category,
  rating,
  author,
  authorReputation = 0,
  content,
  upvotes,
  comments,
  staked,
  timestamp,
  isNFT = false,
  nftPrice,
}: PostCardProps) {
  const [saved, setSaved] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getRatingColor = (r: number) => {
    if (r >= 4.5) return 'text-green-400 bg-green-500/10'
    if (r >= 3.5) return 'text-yellow-400 bg-yellow-500/10'
    if (r >= 2.5) return 'text-orange-400 bg-orange-500/10'
    return 'text-red-400 bg-red-500/10'
  }

  const getReputationBadge = (rep: number) => {
    if (rep >= 1000) return { label: 'Expert', color: 'text-purple-400 bg-purple-500/10' }
    if (rep >= 500) return { label: 'Trusted', color: 'text-blue-400 bg-blue-500/10' }
    if (rep >= 100) return { label: 'Active', color: 'text-green-400 bg-green-500/10' }
    return null
  }

  const repBadge = getReputationBadge(authorReputation)

  return (
    <div className="flex gap-0 bg-[#111113] border border-[#1f1f23] rounded-lg overflow-hidden hover:border-[#2a2a2e] transition-colors">
      {/* Vote Column */}
      <div className="w-12 bg-[#0a0a0b] flex flex-col items-center py-3">
        <VoteButtons initialScore={upvotes} size="md" />
      </div>

      {/* Content */}
      <div className="flex-1 p-3">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-[#6b6b70] mb-2 flex-wrap">
          <span className="text-lg">{projectIcon}</span>
          <a href={`/k/${category}`} className="font-semibold text-[#adadb0] hover:underline">
            k/{category}
          </a>
          <span>•</span>
          <span>Posted by</span>
          <a href={`/u/${author}`} className="hover:underline text-[#adadb0]">
            {author.slice(0, 6)}...{author.slice(-4)}
          </a>
          {repBadge && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${repBadge.color}`}>
              {repBadge.label}
            </span>
          )}
          <span>•</span>
          <span>{formatTimestamp(timestamp)}</span>
          {isNFT && (
            <>
              <span>•</span>
              <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px] font-medium">
                NFT
              </span>
            </>
          )}
        </div>

        {/* Title/Project */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-white hover:text-purple-400 cursor-pointer">
            Review: {project}
          </h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRatingColor(rating)}`}>
            ★ {rating.toFixed(1)}
          </span>
        </div>

        {/* Content Preview */}
        <p className="text-[#adadb0] text-sm mb-3 line-clamp-3">
          {content}
        </p>

        {/* Stake Info */}
        {staked && parseFloat(staked) > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-full text-xs font-medium text-purple-400">
              💰 {staked} $KIND staked
            </span>
            {nftPrice && (
              <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium text-green-400">
                Floor: {nftPrice} ETH
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 text-[#6b6b70]">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#1a1a1d] transition-colors text-xs font-medium">
            <MessageSquare className="w-4 h-4" />
            <span>{comments} Comments</span>
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#1a1a1d] transition-colors text-xs font-medium">
            <Award className="w-4 h-4" />
            <span>Award</span>
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#1a1a1d] transition-colors text-xs font-medium">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          
          <button 
            onClick={() => setSaved(!saved)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#1a1a1d] transition-colors text-xs font-medium ${saved ? 'text-yellow-500' : ''}`}
          >
            <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <div className="relative ml-auto">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded hover:bg-[#1a1a1d] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg shadow-xl z-10">
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#adadb0] hover:bg-[#2a2a2e] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#adadb0] hover:bg-[#2a2a2e] transition-colors">
                  🛒 Buy NFT
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-[#2a2a2e] transition-colors">
                  🚩 Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
