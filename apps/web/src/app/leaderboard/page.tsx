'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Leaderboard } from '@/components/Leaderboard'

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-kindred-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🦞</span>
          <span className="text-xl font-bold">Kindred</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/reviews" className="text-gray-400 hover:text-white transition">
            Reviews
          </Link>
          <Link 
            href="/review" 
            className="bg-kindred-primary/20 text-kindred-primary hover:bg-kindred-primary hover:text-white px-4 py-2 rounded-lg transition"
          >
            Predict & Review
          </Link>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Opinion Markets</h1>
          <p className="text-gray-400 text-lg">
            Stake your predictions on where projects will rank. Settle weekly.
          </p>
        </div>

        {/* How It Works Banner */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <div className="text-2xl mb-2">🔮</div>
            <h3 className="font-semibold mb-1">Predict Rankings</h3>
            <p className="text-sm text-gray-400">Review projects and predict where they'll rank</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold mb-1">Stake OPEN</h3>
            <p className="text-sm text-gray-400">Back your predictions with real stakes</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">Win Rewards</h3>
            <p className="text-sm text-gray-400">Accurate predictions earn from the pool</p>
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />

        {/* CTA */}
        <div className="mt-8 text-center p-8 bg-gradient-to-r from-kindred-primary/20 to-purple-500/20 rounded-xl border border-kindred-primary/30">
          <h2 className="text-2xl font-bold mb-2">Think you know what's next?</h2>
          <p className="text-gray-400 mb-4">
            Submit your review and prediction before rankings settle
          </p>
          <Link 
            href="/review"
            className="inline-block bg-kindred-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Make a Prediction
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 mt-12">
        <p>Built with 🦞 by Team Kindred for Openwork Hackathon 2025</p>
      </footer>
    </main>
  )
}
