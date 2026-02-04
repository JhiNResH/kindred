'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { LeaderboardPreview } from './LeaderboardPreview'
import { DemoFlow } from './DemoFlow'
import { Feed } from './Feed'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Main Layout (Reddit Style) */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          
          {/* Main Feed (Center) */}
          <main>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Latest Reviews</h2>
              <div className="flex gap-2">
                 <button className="px-3 py-1.5 bg-[#1f1f23] rounded-full text-xs font-medium hover:bg-[#2a2a2e] transition-colors">Hot</button>
                 <button className="px-3 py-1.5 text-[#6b6b70] hover:bg-[#1a1a1d] rounded-full text-xs font-medium transition-colors">New</button>
                 <button className="px-3 py-1.5 text-[#6b6b70] hover:bg-[#1a1a1d] rounded-full text-xs font-medium transition-colors">Top</button>
              </div>
            </div>
            
            {/* Feed Component - Remove internal padding/filters if duplicated */}
            <Feed />
          </main>

          {/* Right Sidebar (Widgets) */}
          <aside className="space-y-6 hidden lg:block">
            {/* Platform Stats Widget (Moved from Hero) */}
            <div className="grid grid-cols-2 gap-3">
               <div className="p-4 bg-[#111113] border border-[#1f1f23] rounded-lg">
                  <div className="text-[10px] text-[#6b6b70] uppercase tracking-wider font-semibold mb-1">Total Staked</div>
                  <div className="text-lg font-mono font-bold text-white">$8.4M</div>
                  <div className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    +156%
                  </div>
               </div>
               <div className="p-4 bg-[#111113] border border-[#1f1f23] rounded-lg">
                  <div className="text-[10px] text-[#6b6b70] uppercase tracking-wider font-semibold mb-1">Reviews</div>
                  <div className="text-lg font-mono font-bold text-white">12.8k</div>
                  <div className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                    <span>↑</span>
                    +23%
                  </div>
               </div>
               <div className="col-span-2 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Protected Trades</span>
                    <span className="text-xl font-mono font-bold text-white">94,231</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
               </div>
            </div>

            {/* Leaderboard Widget */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-lg overflow-hidden">
               <div className="p-3 border-b border-[#1f1f23] flex items-center justify-between bg-[#1a1a1d]">
                 <span className="text-xs font-bold uppercase tracking-wider text-[#adadb0]">Market Mindshare</span>
                 <Link href="/leaderboard" className="text-[10px] text-purple-400 hover:text-purple-300">View All</Link>
               </div>
               <LeaderboardPreview />
            </div>

            {/* Trending Communities Widget */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-lg p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#adadb0] mb-4">Trending Communities</h3>
              <div className="space-y-3">
                {[
                  { name: 'r/defi', members: '142k' },
                  { name: 'r/perp-dex', members: '89k' },
                  { name: 'r/memecoins', members: '256k' },
                  { name: 'r/yield-farming', members: '45k' },
                ].map((community) => (
                  <div key={community.name} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                        {community.name[2]}
                      </div>
                      <span className="text-sm font-medium text-[#adadb0] group-hover:text-white transition-colors">{community.name}</span>
                    </div>
                    <button className="px-3 py-1 bg-[#1f1f23] hover:bg-[#2a2a2e] text-xs rounded-full transition-colors">Join</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Links Widget */}
            <div className="text-xs text-[#6b6b70] leading-relaxed px-2">
               <div className="flex flex-wrap gap-2 mb-2">
                 <Link href="#" className="hover:underline">About</Link>
                 <Link href="#" className="hover:underline">Careers</Link>
                 <Link href="#" className="hover:underline">Press</Link>
               </div>
               <div className="flex flex-wrap gap-2">
                 <Link href="#" className="hover:underline">Terms</Link>
                 <Link href="#" className="hover:underline">Privacy</Link>
                 <Link href="#" className="hover:underline">Bug Bounty</Link>
               </div>
               <div className="mt-4">
                 © 2026 Kindred. All rights reserved.
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
