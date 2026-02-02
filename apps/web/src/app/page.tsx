'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Home() {
  return (
    <main className="min-h-screen bg-kindred-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦞</span>
          <span className="text-xl font-bold">Kindred</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="text-gray-400 hover:text-white transition">
            Rankings
          </Link>
          <Link href="/stake" className="text-gray-400 hover:text-white transition">
            Stake
          </Link>
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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-6">
          <span>🔮</span>
          <span>Opinion Markets for Web3</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-kindred-primary">Predict.</span>
          <br />
          <span className="text-white">Stake.</span>
          <br />
          <span className="text-purple-400">Earn.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-8">
          Stake your predictions on Web3 project rankings. 
          DeFi, Perp DEX, Memecoins, AI Agents — every week, the community decides.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/leaderboard"
            className="bg-kindred-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            View Rankings
          </Link>
          <Link 
            href="/review"
            className="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Make a Prediction
          </Link>
        </div>
      </section>

      {/* Markets */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Opinion Markets</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <MarketCard category="k/defi" icon="🏦" label="DeFi" count={156} />
            <MarketCard category="k/perp-dex" icon="📈" label="Perp DEX" count={89} />
            <MarketCard category="k/memecoin" icon="🐸" label="Memecoins" count={234} />
            <MarketCard category="k/ai" icon="🤖" label="AI Agents" count={67} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔮"
            title="Predict Rankings"
            description="Stake on where you think projects will rank each week. Be right, get rewarded."
          />
          <FeatureCard
            icon="📊"
            title="Stake-Weighted Votes"
            description="Your prediction weight scales with your stake. Put your money where your mouth is."
          />
          <FeatureCard
            icon="🏆"
            title="Weekly Settlements"
            description="Every week, rankings resolve and winners collect from the prediction pool."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Step number={1} text="Pick a Market" />
            <Arrow />
            <Step number={2} text="Review & Predict" />
            <Arrow />
            <Step number={3} text="Stake OPEN" />
            <Arrow />
            <Step number={4} text="Win Rewards" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500">
        <p>Built with 🦞 by Team Kindred for Openwork Hackathon 2025</p>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 hover:border-kindred-primary transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-kindred-primary flex items-center justify-center text-xl font-bold mb-2">
        {number}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

function Arrow() {
  return <span className="text-gray-600 hidden md:block">→</span>
}

function MarketCard({ category, icon, label, count }: { category: string; icon: string; label: string; count: number }) {
  return (
    <Link 
      href={`/leaderboard?category=${category}`}
      className="bg-kindred-dark border border-gray-800 rounded-xl p-6 hover:border-kindred-primary transition group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{label}</h3>
      <p className="text-sm text-gray-500">{count} predictions</p>
    </Link>
  )
}
