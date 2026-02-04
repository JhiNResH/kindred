'use client'

import React from 'react'

type Category = 'all' | 'k/defi' | 'k/perp-dex' | 'k/memecoin' | 'k/ai'

interface CommunitySidebarProps {
  selectedCategory: Category
  onSelectCategory: (category: Category) => void
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'all', label: 'All Communities', icon: '🏠' },
  { value: 'k/defi', label: 'DeFi', icon: '🏦' },
  { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈' },
  { value: 'k/memecoin', label: 'Memecoins', icon: '🐸' },
  { value: 'k/ai', label: 'AI Agents', icon: '🤖' },
]

export function CommunitySidebar({ selectedCategory, onSelectCategory }: CommunitySidebarProps) {
  return (
    <div className="w-64 flex-shrink-0 hidden lg:block">
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden sticky top-24">
        <div className="p-4 border-b border-[#1f1f23]">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Feeds</h2>
        </div>
        
        <nav className="p-2 space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-kindred-primary/10 text-kindred-primary'
                  : 'text-gray-400 hover:bg-[#1a1a1d] hover:text-white'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1f1f23] mt-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Resources</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <a href="#" className="block hover:text-white transition">About Kindred</a>
            <a href="#" className="block hover:text-white transition">Content Policy</a>
            <a href="#" className="block hover:text-white transition">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}
