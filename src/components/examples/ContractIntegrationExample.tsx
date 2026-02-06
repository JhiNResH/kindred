/**
 * Example: Contract Integration with KindredComment
 * Shows complete flow: Approve → Stake → Create Comment → Vote
 */

'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import {
  useKindBalance,
  useKindAllowance,
  useApproveKind,
  formatKind,
  parseKind,
} from '@/hooks/useKindToken'
import {
  useCreateComment,
  useUpvote,
  useDownvote,
  useComment,
  useNetScore,
} from '@/hooks/useKindredComment'

export default function ContractIntegrationExample() {
  const { address, isConnected } = useAccount()

  // Token state
  const { data: balance } = useKindBalance(address)
  const { data: allowance } = useKindAllowance(address)
  const { approve, isPending: isApproving, isSuccess: isApproved } = useApproveKind()

  // Comment state
  const [projectId, setProjectId] = useState('')
  const [content, setContent] = useState('')
  const [stakeAmount, setStakeAmount] = useState('100')
  
  const {
    createComment,
    isPending: isCreating,
    isSuccess: isCreated,
    hash: createHash,
  } = useCreateComment()

  // Vote state
  const [tokenIdToVote, setTokenIdToVote] = useState('')
  const [voteAmount, setVoteAmount] = useState('10')
  const { upvote, isPending: isUpvoting } = useUpvote()
  const { downvote, isPending: isDownvoting } = useDownvote()

  // View state
  const [viewTokenId, setViewTokenId] = useState('')
  const { data: commentData } = useComment(viewTokenId ? BigInt(viewTokenId) : undefined)
  const { data: netScore } = useNetScore(viewTokenId ? BigInt(viewTokenId) : undefined)

  if (!isConnected) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <WalletButton />
      </div>
    )
  }

  const MIN_STAKE = parseKind('100') // 100 KIND tokens
  const needsApproval = !allowance || (allowance as bigint) < MIN_STAKE
  const hasBalance = balance && (balance as bigint) >= MIN_STAKE

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Kindred Contract Integration</h1>
        <p className="text-gray-600">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <p className="text-sm text-gray-500">
          Balance: {balance ? formatKind(balance as bigint) : '0'} KIND
        </p>
      </div>

      {/* Step 1: Approve */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 1: Approve Tokens</h2>
        <p className="text-sm text-gray-600 mb-4">
          Allow KindredComment contract to spend your KIND tokens
        </p>
        
        {needsApproval ? (
          <button
            onClick={() => approve(parseKind('1000000').toString())} // Approve 1M tokens
            disabled={isApproving || !hasBalance}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isApproving ? 'Approving...' : 'Approve KIND Tokens'}
          </button>
        ) : (
          <div className="text-green-600 font-semibold">✓ Approved</div>
        )}

        {!hasBalance && (
          <p className="text-red-500 text-sm mt-2">
            Insufficient balance. You need at least 100 KIND tokens.
          </p>
        )}
      </div>

      {/* Step 2: Create Comment */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 2: Create Comment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="e.g., uniswap"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (IPFS hash)</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., QmXXX..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stake Amount (KIND)</label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="100"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 100 KIND</p>
          </div>

          <button
            onClick={() => {
              if (!projectId || !content) {
                alert('Please fill all fields')
                return
              }
              const stakeWei = parseKind(stakeAmount)
              createComment({
                targetAddress: projectId as `0x${string}`,
                content: content,
                stakeAmount: stakeWei.toString(),
              })
            }}
            disabled={isCreating || needsApproval || !hasBalance}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Comment (Stake + Mint NFT)'}
          </button>

          {isCreated && createHash && (
            <div className="text-green-600 text-sm">
              ✓ Comment created! TX: {createHash.slice(0, 10)}...
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Vote */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 3: Vote on Comment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Comment Token ID</label>
            <input
              type="number"
              value={tokenIdToVote}
              onChange={(e) => setTokenIdToVote(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vote Amount (KIND)</label>
            <input
              type="number"
              value={voteAmount}
              onChange={(e) => setVoteAmount(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => upvote(BigInt(tokenIdToVote), parseKind(voteAmount))}
              disabled={isUpvoting || !tokenIdToVote || needsApproval}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isUpvoting ? 'Upvoting...' : '👍 Upvote'}
            </button>

            <button
              onClick={() => downvote(BigInt(tokenIdToVote), parseKind(voteAmount))}
              disabled={isDownvoting || !tokenIdToVote || needsApproval}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isDownvoting ? 'Downvoting...' : '👎 Downvote'}
            </button>
          </div>
        </div>
      </div>

      {/* Step 4: View Comment */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 4: View Comment Data</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Comment Token ID</label>
            <input
              type="number"
              value={viewTokenId}
              onChange={(e) => setViewTokenId(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {commentData ? (() => {
            const data = commentData as any[]
            return (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div><strong>Author:</strong> {String(data[0])}</div>
                <div><strong>Project ID:</strong> {String(data[1])}</div>
                <div><strong>Content Hash:</strong> {String(data[2])}</div>
                <div><strong>Stake:</strong> {formatKind(data[4] as bigint)} KIND</div>
                <div><strong>Upvote Value:</strong> {formatKind(data[5] as bigint)} KIND</div>
                <div><strong>Downvote Value:</strong> {formatKind(data[6] as bigint)} KIND</div>
                <div><strong>Net Score:</strong> {netScore?.toString() || 'N/A'}</div>
                <div><strong>Created:</strong> {new Date(Number(data[9]) * 1000).toLocaleString()}</div>
              </div>
            )
          })() : null}
        </div>
      </div>
    </div>
  )
}
