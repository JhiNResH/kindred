'use client'

import Link from 'next/link'
import { Bot, BarChart2, Coins, Dog, ArrowRight } from 'lucide-react'
import { HeroSection } from './HeroSection'
import { DemoFlow } from './DemoFlow'
import { Feed } from './Feed'

const MARKET_CATEGORIES = [
  { id: 'k/defi', name: 'DeFi', icon: Coins, count: 128, color: 'purple' },
  { id: 'k/perp-dex', name: 'Perp DEX', icon: BarChart2, count: 42, color: 'blue' },
  { id: 'k/ai', name: 'AI Agents', icon: Bot, count: 89, color: 'green' },
  { id: 'k/memecoin', name: 'Memecoins', icon: Dog, count: 256, color: 'orange' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Hero */}
      <HeroSection />

      {/* Markets Overview */}
      <section className="py-16 px-4 border-t border-[#1f1f23]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Active Markets</h2>
              <p className="text-[#6b6b70]">Predict rankings across Web3 categories</p>
            </div>
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All Markets
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {MARKET_CATEGORIES.map((market) => {
              const Icon = market.icon
              const colorClasses = {
                purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
                blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
                green: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
                orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50',
              }
              const textColors = {
                purple: 'text-purple-400',
                blue: 'text-blue-400',
                green: 'text-green-400',
                orange: 'text-orange-400',
              }

              return (
                <Link
                  key={market.id}
                  href={`/leaderboard?category=${market.id}`}
                  className={`group p-6 rounded-xl bg-gradient-to-br ${colorClasses[market.color as keyof typeof colorClasses]} border transition-all hover:translate-y-[-2px]`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-[#0a0a0b]/50 flex items-center justify-center mb-4 ${textColors[market.color as keyof typeof textColors]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{market.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b6b70]">{market.count} projects</span>
                    <ArrowRight className="w-4 h-4 text-[#6b6b70] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-[#111113]/50">
        <div className="max-w-5xl mx-auto">
          <DemoFlow />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 px-4 border-t border-[#1f1f23]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Recent Predictions</h2>
              <p className="text-[#6b6b70]">See what the community is saying</p>
            </div>
            <Link
              href="/reviews"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <Feed />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-500/10 via-[#0a0a0b] to-blue-500/10 border-t border-[#1f1f23]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Predict?</h2>
          <p className="text-[#adadb0] text-lg mb-8">
            Join thousands of predictors shaping the future of Web3 rankings.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/review"
              className="px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl text-white font-semibold hover:translate-y-[-2px] hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              Write Your First Review
            </Link>
            <Link
              href="/stake"
              className="px-8 py-4 bg-[#111113] border border-[#2a2a2e] rounded-xl text-[#adadb0] font-semibold hover:bg-[#1a1a1d] hover:text-white transition-all"
            >
              Stake a Prediction
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#1f1f23]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Kindred" className="w-8 h-8 rounded-md" />
              <span className="text-lg font-semibold">Kindred</span>
            </div>
            <div className="flex gap-8 text-sm text-[#6b6b70]">
              <Link href="/leaderboard" className="hover:text-white transition-colors">Markets</Link>
              <Link href="/reviews" className="hover:text-white transition-colors">Reviews</Link>
              <Link href="/stake" className="hover:text-white transition-colors">Stake</Link>
              <a href="https://github.com/openwork-hackathon/team-kindred" target="_blank" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <div className="text-sm text-[#6b6b70]">
              Built for Hookathon 2026 🪝
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
