'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const NAV_ITEMS = [
  { href: '/app', label: 'App' },
  { href: '/markets', label: 'Markets' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 px-6 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">🦞 KINDRED</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${
                pathname === item.href
                  ? 'text-purple-400'
                  : 'text-[#adadb0] hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a 
            href="https://mint.club/token/base/KIND" 
            target="_blank"
            className="px-3 py-1.5 text-xs bg-purple-500/10 text-purple-400 rounded-md hover:bg-purple-500/20 transition"
          >
            Buy $KIND
          </a>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

export default Navigation
