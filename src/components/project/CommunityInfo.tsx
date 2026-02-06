'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CommunityInfoProps {
  category: string
}

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  'all': {
    title: 'k/kindred',
    description: 'The trust layer for crypto. Review projects, stake on your opinions, and build on-chain reputation.',
  },
  'k/defi': {
    title: 'k/DeFi',
    description: 'Discuss decentralized finance protocols, yields, and risks. The pulse of open finance.',
  },
  'k/perp-dex': {
    title: 'k/PerpDEX',
    description: 'Leverage trading, funding rates, and exchange reviews. Where the degens live.',
  },
  'k/memecoin': {
    title: 'k/Memecoin',
    description: 'Moonshots, rugs, and gems. High risk, high reward community reviews.',
  },
  'k/ai': {
    title: 'k/AI',
    description: 'Artificial Intelligence agents and protocols. The future is autonomous.',
  }
}

export function CommunityInfo({ category }: CommunityInfoProps) {
  const meta = CATEGORY_META[category] || CATEGORY_META['all']
  const [members, setMembers] = useState('-')
  const [staked, setStaked] = useState('-')

  useEffect(() => {
    async function fetchCommunityStats() {
      try {
        const res = await fetch(`/api/communities?category=${category}`)
        const data = await res.json()
        if (data.members) setMembers(data.members)
        if (data.staked) setStaked(data.staked)
      } catch (error) {
        console.error('Failed to fetch community stats:', error)
      }
    }
    fetchCommunityStats()
  }, [category])

  return (
    <div className="w-80 flex-shrink-0 hidden xl:block">
      {/* About Community Card */}
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden sticky top-24">
        {/* Banner */}
        <div className="h-12 bg-gradient-to-r from-kindred-primary/20 to-purple-500/20"></div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 -mt-8">
            <div className="w-12 h-12 bg-[#111113] rounded-full p-1">
              <div className="w-full h-full bg-kindred-primary rounded-full flex items-center justify-center text-xl">
                🦞
              </div>
            </div>
            <h2 className="font-bold text-lg pt-6">{meta.title}</h2>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            {meta.description}
          </p>

          <div className="flex gap-8 mb-6 border-b border-[#1f1f23] pb-4">
            <div>
              <div className="font-bold">{members}</div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
            <div>
              <div className="font-bold">{staked}</div>
              <div className="text-xs text-gray-500">Staked</div>
            </div>
          </div>

          <div className="space-y-3">
            <Link 
              href="/review"
              className="block w-full text-center bg-kindred-primary hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition"
            >
              Create Post
            </Link>
            <Link 
              href="/leaderboard"
              className="block w-full text-center border border-[#2a2a2e] hover:bg-[#1a1a1d] text-white font-medium py-2 rounded-lg transition"
            >
              View Rankings
            </Link>
          </div>
        </div>

        {/* Rules Section */}
        <div className="p-4 border-t border-[#1f1f23]">
          <h3 className="font-semibold text-sm mb-3">Community Rules</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="font-bold text-gray-600">1.</span>
              <span>Be respectful and constructive</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-600">2.</span>
              <span>Back claims with evidence</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-600">3.</span>
              <span>No shillspam or bots</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
