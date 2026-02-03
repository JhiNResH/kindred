'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Shield, Coins } from 'lucide-react'

const ROTATING_WORDS = ['DeFi', 'Perp DEX', 'Memecoins', 'AI Agents']

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
        setIsAnimating(false)
      }, 200)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden py-20 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Opinion Markets for Web3</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">Predict the Future of</span>
          <br />
          <span 
            className={`bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {ROTATING_WORDS[wordIndex]}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-[#adadb0] max-w-2xl mx-auto mb-10 leading-relaxed">
          Stake your predictions on Web3 project rankings. 
          Write reviews, earn reputation, and win rewards when you're right.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/leaderboard"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl text-white font-semibold text-lg hover:translate-y-[-2px] hover:shadow-xl hover:shadow-purple-500/30 transition-all"
          >
            Start Predicting
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/reviews"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#111113] border border-[#2a2a2e] rounded-xl text-[#adadb0] font-semibold text-lg hover:bg-[#1a1a1d] hover:text-white hover:border-[#3a3a3e] transition-all"
          >
            Browse Reviews
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-3 p-6 bg-[#111113]/50 border border-[#1f1f23] rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">$2.4M+</div>
              <div className="text-sm text-[#6b6b70]">Total Value Staked</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-[#111113]/50 border border-[#1f1f23] rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Coins className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">12,847</div>
              <div className="text-sm text-[#6b6b70]">Predictions Made</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-[#111113]/50 border border-[#1f1f23] rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Audited</div>
              <div className="text-sm text-[#6b6b70]">Smart Contracts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
