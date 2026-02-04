'use client'

import Link from 'next/link'
import { ShieldCheck, TrendingUp, Shield } from 'lucide-react'

export function HeroSection() {
  return (
    <div className="flex flex-col items-center gap-6 py-20 px-6 text-center">
      {/* Badge */}
      <div className="animate-in inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
        <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
        <span className="text-xs font-medium text-purple-500">Protected by Uniswap V4 Hooks</span>
      </div>

      {/* Title */}
      <h1 className="animate-in delay-1 max-w-4xl text-[56px] font-medium leading-[1.1] tracking-tight bg-gradient-to-b from-white to-[#adadb0] bg-clip-text text-transparent">
        Trust Layer for DeFi
      </h1>

      {/* Subtitle */}
      <p className="animate-in delay-2 max-w-2xl text-lg text-[#adadb0] leading-relaxed">
        Stake-backed reviews that protect your trades. Write reviews, earn from
        NFT sales, build reputation on-chain.
      </p>

      {/* CTAs */}
      <div className="animate-in delay-3 flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
        <Link 
          href="/review"
          className="px-8 py-3.5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg text-white font-medium hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
        >
          Write Your First Review
        </Link>
        <Link 
          href="/leaderboard"
          className="px-8 py-3.5 bg-transparent border border-[#2a2a2e] rounded-lg text-[#adadb0] font-medium hover:bg-[#111113] hover:text-white transition-all flex items-center justify-center gap-2"
        >
          Explore Projects
        </Link>
      </div>
    </div>
  )
}
