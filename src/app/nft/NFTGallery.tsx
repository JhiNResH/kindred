'use client'

import { useAccount } from 'wagmi'
import { WalletButton } from '@/components/WalletButton'
import { Image as ImageIcon, ExternalLink, Share2 } from 'lucide-react'

// Mock NFT data
const MOCK_NFTS = [
  {
    tokenId: '1',
    project: 'Uniswap',
    content: 'Best DEX on Ethereum. Great UX and liquidity.',
    rating: 5,
    stakeAmount: '10',
    createdAt: new Date('2026-01-15'),
    upvotes: 234,
    earnings: '57.80',
  },
  {
    tokenId: '2',
    project: 'Aave',
    content: 'Solid lending protocol with great risk management.',
    rating: 5,
    stakeAmount: '25',
    createdAt: new Date('2026-01-20'),
    upvotes: 189,
    earnings: '123.70',
  },
  {
    tokenId: '3',
    project: 'Curve',
    content: 'Best stablecoin DEX. Low slippage for large trades.',
    rating: 4,
    stakeAmount: '5',
    createdAt: new Date('2026-02-01'),
    upvotes: 67,
    earnings: '18.10',
  },
]

export function NFTGallery() {
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">My Review NFTs</h1>
            <p className="text-gray-400 mb-8">
              Connect your wallet to view your review NFTs
            </p>
            <WalletButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold">My Review NFTs</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Your reviews are ERC-721 NFTs. They can be traded, and you earn from x402 unlocks.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-1">{MOCK_NFTS.length}</div>
            <div className="text-sm text-gray-400">Total NFTs</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-1">
              {MOCK_NFTS.reduce((sum, nft) => sum + nft.upvotes, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Upvotes</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-1">
              ${MOCK_NFTS.reduce((sum, nft) => sum + parseFloat(nft.earnings), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Total Earned</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-1">
              {MOCK_NFTS.reduce((sum, nft) => sum + parseInt(nft.stakeAmount), 0)}
            </div>
            <div className="text-sm text-gray-400">KIND Staked</div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_NFTS.map((nft) => (
            <div
              key={nft.tokenId}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition group"
            >
              {/* NFT Image/Thumbnail */}
              <div className="aspect-square bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-b border-gray-800 flex items-center justify-center relative">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎭</div>
                  <div className="text-2xl font-bold mb-2">{nft.project}</div>
                  <div className="flex items-center justify-center gap-1">
                    {Array(nft.rating).fill(0).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                </div>

                {/* Token ID Badge */}
                <div className="absolute top-4 left-4 bg-gray-900/90 px-3 py-1 rounded-lg text-sm">
                  #{nft.tokenId}
                </div>

                {/* Share Button */}
                <button className="absolute top-4 right-4 bg-gray-900/90 hover:bg-gray-800 p-2 rounded-lg transition opacity-0 group-hover:opacity-100">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* NFT Info */}
              <div className="p-6">
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {nft.content}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 mb-1">Upvotes</div>
                    <div className="font-bold">{nft.upvotes}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 mb-1">Earned</div>
                    <div className="font-bold text-green-400">${nft.earnings}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div>Staked: {nft.stakeAmount} KIND</div>
                  <div>{nft.createdAt.toLocaleDateString()}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`https://sepolia.basescan.org/token/0xb3bb93089404ce4c2f64535e5d513093625fedc8?a=${nft.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Basescan
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No NFTs State */}
        {MOCK_NFTS.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No NFTs Yet</h3>
            <p className="text-gray-400 mb-6">
              Write your first review to mint an NFT!
            </p>
            <a
              href="/review"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Write Review
            </a>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-3">💡 About Review NFTs</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Each review is minted as an ERC-721 NFT</li>
            <li>• You earn when others unlock your review (x402)</li>
            <li>• You earn from future upvotes on your review</li>
            <li>• NFTs can be traded on OpenSea and other marketplaces</li>
            <li>• Staking increases your reputation score</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
