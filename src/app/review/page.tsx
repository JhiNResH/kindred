'use client'

import Link from 'next/link'
import { WalletButton } from '@/components/WalletButton'
import { ReviewForm } from '@/components/reviews/ReviewForm'

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-kindred-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🦞</span>
          <span className="text-xl font-bold">Kindred</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/reviews" 
            className="text-gray-400 hover:text-white transition"
          >
            Browse Reviews
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-white">Write Review</span>
        </div>

        {/* Info Banner */}
        <div className="bg-kindred-primary/10 border border-kindred-primary/30 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold mb-1">How it works</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Your review will be minted as an NFT</li>
                <li>• Stake $OPEN to boost your reputation score</li>
                <li>• Earn upvotes from the community</li>
                <li>• Build your on-chain credibility</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <ReviewForm />

        {/* Tips */}
        <div className="mt-8 p-6 bg-gray-900/50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>📝</span>
            Tips for a Great Review
          </h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>✓ Be specific about your experience</li>
            <li>✓ Include pros and cons</li>
            <li>✓ Mention any security concerns if applicable</li>
            <li>✓ Stake to show you're confident in your review</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 mt-12">
        <p>Built with 🦞 by Team Kindred for Openwork Hackathon 2025</p>
      </footer>
    </main>
  )
}
