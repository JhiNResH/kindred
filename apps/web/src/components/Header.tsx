'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Bell } from 'lucide-react'
import { WalletButton } from './WalletButton'

const NAV_LINKS = [
  { href: '/leaderboard', label: 'Markets' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/stake', label: 'Stake' },
  { href: '/review', label: 'Write' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img 
              src="/logo.jpg" 
              alt="Kindred" 
              className="w-8 h-8 rounded-md object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦞</text></svg>'
              }}
            />
            <span className="text-xl font-bold tracking-wide text-white hidden sm:block">
              KINDRED
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-[#adadb0] hover:text-white hover:bg-[#111113]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-[#6b6b70] hover:text-white hover:bg-[#111113] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-[#6b6b70] hover:text-white hover:bg-[#111113] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
            </button>

            {/* Wallet */}
            <WalletButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#6b6b70] hover:text-white hover:bg-[#111113] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-[#1f1f23]">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111113] border border-[#1f1f23] rounded-lg">
              <Search className="w-4 h-4 text-[#6b6b70]" />
              <input
                type="text"
                placeholder="Search markets, reviews, users..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-[#6b6b70]"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-[#6b6b70] bg-[#0a0a0b] rounded border border-[#1f1f23]">
                ESC
              </kbd>
            </div>
          </div>
        )}

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
      </div>
    </header>
  )
}
