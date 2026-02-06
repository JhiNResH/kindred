'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Search, Bell, Bot, SquarePen } from 'lucide-react'
import { WalletButton } from './WalletButton'

const NAV_LINKS = [
  { href: '/leaderboard', label: 'Markets' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/stake', label: 'Stake' },
  { href: '/review', label: 'Write' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23] h-[65px]">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <img 
              src="/logo.jpg" 
              alt="Kindred" 
              className="w-8 h-8 rounded-md object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦞</text></svg>'
              }}
            />
            <span className="text-[22px] font-bold tracking-wide text-[#d9d4e8] font-['Cinzel_Decorative'] hidden sm:block">
              KINDRED
              <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mb-1"></span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[480px] hidden md:block">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b70] group-focus-within:text-purple-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              placeholder="Search boards, projects, reviews..."
              className="w-full bg-[#111113] border border-[#1f1f23] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#6b6b70] focus:outline-none focus:border-purple-500 focus:bg-[#0d0d0e] transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement
                  const query = target.value.trim()
                  if (query) {
                    // ✅ Use Next.js router for smooth navigation
                    router.push(`/project/${query.toLowerCase()}`)
                  }
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[#2a2a2e] bg-[#1a1a1d] px-1.5 font-mono text-[10px] font-medium text-[#adadb0]">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link 
            href="/review"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-kindred-primary text-white text-[13px] font-medium hover:bg-orange-600 transition-colors"
          >
            <SquarePen className="w-4 h-4" />
            <span>Post</span>
          </Link>
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a2a2e] text-[#adadb0] text-[13px] font-medium hover:bg-[#111113] hover:text-white transition-colors">
            <Bot className="w-4 h-4" />
            <span>Agent</span>
          </button>
          
          <WalletButton />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#6b6b70] hover:text-white hover:bg-[#111113] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#1f1f23]">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'text-[#adadb0] hover:text-white hover:bg-[#111113]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
    </header>
  )
}
