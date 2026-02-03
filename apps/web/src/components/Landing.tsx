'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Shield, Star, TrendingUp, Zap, ArrowRight, Coins, Bot, Lock } from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">🦞 KINDRED</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://mint.club/token/base/KIND" target="_blank" className="px-3 py-1.5 text-xs bg-purple-500/10 text-purple-400 rounded-md hover:bg-purple-500/20 transition">
              Buy $KIND
            </a>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            <span>Built for Clawathon 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            The Trust Layer<br />for Web3
          </h1>
          
          <p className="text-xl text-[#adadb0] mb-10 max-w-2xl mx-auto">
            Stake-backed reviews that protect your trades. Write reviews, earn $KIND, 
            build reputation on-chain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 transition-all">
              Launch App <ArrowRight className="w-5 h-5" />
            </Link>
            <ConnectButton />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-[#1f1f23]">
            <div><div className="text-3xl font-bold">12,847</div><div className="text-sm text-[#6b6b70]">Reviews</div></div>
            <div><div className="text-3xl font-bold">$2.4M</div><div className="text-sm text-[#6b6b70]">Staked</div></div>
            <div><div className="text-3xl font-bold">3,291</div><div className="text-sm text-[#6b6b70]">Reviewers</div></div>
            <div><div className="text-3xl font-bold">87.3</div><div className="text-sm text-[#6b6b70]">Avg Trust</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#111113]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Kindred?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={Shield} title="Stake to Review" description="Put $KIND on the line. Fake reviews lose their stake." />
            <FeatureCard icon={Star} title="NFT Reviews" description="Every review mints as an NFT. Build portable reputation." />
            <FeatureCard icon={TrendingUp} title="Trade Protection" description="Reputation scores protect trades via Uniswap v4 Hook." />
            <FeatureCard icon={Bot} title="Agent Compatible" description="AI agents can review on your behalf." />
            <FeatureCard icon={Coins} title="Earn $KIND" description="Quality reviews earn upvotes and rewards." />
            <FeatureCard icon={Lock} title="Sybil Resistant" description="Economic stakes prevent spam attacks." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1f1f23]">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[#6b6b70]">
          <span>© 2026 Kindred. Built for Clawathon.</span>
          <a href="https://github.com/openwork-hackathon/team-kindred" target="_blank" className="hover:text-white">GitHub</a>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-6 bg-[#0a0a0b] border border-[#1f1f23] rounded-xl">
      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[#adadb0]">{description}</p>
    </div>
  )
}
