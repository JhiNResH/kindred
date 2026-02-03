'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Mock data for leaderboard
const LEADERBOARD_DATA = [
  { rank: 1, name: 'Aave V3', address: '0x8787...A4E2', score: 94, reviews: 234, change: 0 },
  { rank: 2, name: 'Uniswap V4', address: '0x1F98...F984', score: 91, reviews: 189, change: 2 },
  { rank: 3, name: 'Compound III', address: '0xc3d6...cdc3', score: 88, reviews: 156, change: -1 },
  { rank: 4, name: 'Lido', address: '0xae7a...fE84', score: 85, reviews: 142, change: 1 },
  { rank: 5, name: 'MakerDAO', address: '0x9f8F...79A2', score: 82, reviews: 128, change: -1 },
]

// Mock data for reviews
const RECENT_REVIEWS = [
  {
    id: 1,
    author: '0xVitalik.eth',
    avatar: '👨‍💻',
    target: 'Uniswap V4',
    rating: 5,
    content: 'Revolutionary hook system. The new architecture enables unprecedented customization for liquidity providers.',
    staked: '500 OPEN',
    time: '2h ago',
    upvotes: 47,
  },
  {
    id: 2,
    author: 'DeFiChad.eth',
    avatar: '🦍',
    target: 'Aave V3',
    rating: 4,
    content: 'Solid lending protocol. E-mode is game-changing for correlated assets. Minor UX improvements needed.',
    staked: '250 OPEN',
    time: '5h ago',
    upvotes: 32,
  },
  {
    id: 3,
    author: 'CryptoAnon',
    avatar: '🥷',
    target: 'Compound III',
    rating: 4,
    content: 'Great simplification of the protocol. Single-asset design reduces complexity significantly.',
    staked: '100 OPEN',
    time: '8h ago',
    upvotes: 28,
  },
]

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Kindred" width={32} height={32} className="rounded-md" />
          <span className="text-[#d9d4e8] font-bold text-2xl tracking-wider" style={{ fontFamily: 'Cinzel Decorative, cursive' }}>
            KINDRED
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#111113] border border-[#1f1f23] rounded-lg focus-within:border-[#a855f7]">
            <svg className="w-4 h-4 text-[#6b6b70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects, reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-[#6b6b70]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-5 py-2.5 text-sm font-medium text-[#adadb0] border border-[#2a2a2e] rounded-lg hover:bg-[#111113] hover:text-white transition-all">
            Agent
          </button>
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#a855f7] to-[#7c3aed] rounded-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center gap-6 px-10 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 rounded-full">
          <span className="text-purple-400">🛡️</span>
          <span className="text-purple-400 text-xs font-medium">Trust Layer for DeFi</span>
        </div>

        <h1 className="max-w-3xl text-5xl font-medium tracking-tight bg-gradient-to-b from-white to-[#adadb0] bg-clip-text text-transparent">
          Stake-Backed Reviews That Protect Your Trades
        </h1>

        <p className="max-w-xl text-lg text-[#adadb0]">
          Write honest reviews, stake your reputation, and earn from NFT sales. 
          Build trust on-chain while protecting the community from scams.
        </p>

        <div className="flex gap-4 mt-4">
          <Link href="/review" className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#a855f7] to-[#7c3aed] rounded-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all">
            Write a Review
          </Link>
          <Link href="/leaderboard" className="px-6 py-3 text-sm font-medium text-[#adadb0] border border-[#2a2a2e] rounded-lg hover:bg-[#111113] hover:text-white transition-all">
            View Rankings
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="flex justify-center gap-20 px-10 py-12 border-y border-[#1f1f23]">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
            2,547
          </div>
          <div className="text-sm text-[#6b6b70] mt-1">Reviews</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
            1.2M
          </div>
          <div className="text-sm text-[#6b6b70] mt-1">OPEN Staked</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
            892
          </div>
          <div className="text-sm text-[#6b6b70] mt-1">Projects Rated</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
            156
          </div>
          <div className="text-sm text-[#6b6b70] mt-1">Scams Exposed</div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="px-10 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Top Rated Projects</h2>
            <p className="text-[#6b6b70] mt-1">Ranked by stake-weighted community reviews</p>
          </div>
          <Link href="/leaderboard" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all →
          </Link>
        </div>

        <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f23]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6b6b70] uppercase">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6b6b70] uppercase">Project</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6b6b70] uppercase">Score</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6b6b70] uppercase">Reviews</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6b6b70] uppercase">Change</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD_DATA.map((item) => (
                <tr key={item.rank} className="border-b border-[#1f1f23] hover:bg-purple-500/5 transition-colors">
                  <td className="px-6 py-4">
                    {item.rank === 1 && '🥇'}
                    {item.rank === 2 && '🥈'}
                    {item.rank === 3 && '🥉'}
                    {item.rank > 3 && `#${item.rank}`}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <code className="text-xs text-[#6b6b70]">{item.address}</code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium">
                      {item.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#adadb0]">{item.reviews}</td>
                  <td className="px-6 py-4">
                    {item.change > 0 && <span className="text-green-500">▲{item.change}</span>}
                    {item.change < 0 && <span className="text-red-500">▼{Math.abs(item.change)}</span>}
                    {item.change === 0 && <span className="text-[#6b6b70]">―</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="px-10 py-16 bg-[#0d0d0e]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Recent Reviews</h2>
            <p className="text-[#6b6b70] mt-1">Latest stake-backed opinions from the community</p>
          </div>
          <Link href="/reviews" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RECENT_REVIEWS.map((review) => (
            <div key={review.id} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6 hover:border-[#2a2a2e] hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{review.avatar}</span>
                  <div>
                    <div className="font-medium text-sm">{review.author}</div>
                    <div className="text-xs text-[#6b6b70]">{review.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-[#2a2a2e]'}>★</span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <span className="text-xs text-purple-400">Reviewing: </span>
                <span className="text-sm font-medium">{review.target}</span>
              </div>

              <p className="text-sm text-[#adadb0] mb-4 line-clamp-3">{review.content}</p>

              <div className="flex items-center justify-between pt-4 border-t border-[#1f1f23]">
                <span className="text-xs text-[#6b6b70]">Staked: {review.staked}</span>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-xs text-[#6b6b70] hover:text-purple-400 transition-colors">
                    <span>▲</span>
                    <span>{review.upvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-10 border-t border-[#1f1f23]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b6b70]">
            Built with 🦞 by Team Kindred for Clawathon 2025
          </span>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[#adadb0] hover:text-white transition-colors">Docs</a>
            <a href="#" className="text-sm text-[#adadb0] hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-sm text-[#adadb0] hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
