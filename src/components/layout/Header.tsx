'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Search, SquarePen } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { CreateReviewModal } from '@/components/reviews/CreateReviewModal'
import { SearchModal } from '@/components/search/SearchModal'

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
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Global keyboard shortcut for search (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ... (render logic)

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23] h-[65px]">
        {/* ... (existing header structure) ... */}
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <img 
                src="/logo.jpg" 
                alt="Maat" 
                className="w-8 h-8 rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦞</text></svg>'
                }}
              />
              <span className="text-[22px] font-bold tracking-wide text-[#d9d4e8] font-['Cinzel_Decorative'] hidden sm:block">
                MAAT
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mb-1"></span>
              </span>
            </Link>
          </div>

          {/* Center: Search Bar (opens modal) - hidden on gourmet pages */}
          {!pathname.startsWith('/m/gourmet') && (
            <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[480px] hidden md:block">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full relative group"
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b70] group-hover:text-purple-500 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <div className="w-full bg-[#111113] border border-[#1f1f23] rounded-lg py-2.5 pl-10 pr-4 text-sm text-left text-[#6b6b70] hover:border-purple-500/50 hover:bg-[#0d0d0e] transition-all">
                  Search projects, reviews, or analyze with AI...
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[#2a2a2e] bg-[#1a1a1d] px-1.5 font-mono text-[10px] font-medium text-[#adadb0]">
                    ⌘K
                  </kbd>
                </div>
              </button>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Scarab Balance */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg">
              <span className="text-base">🪲</span>
              <span className="text-sm font-mono font-bold text-amber-400">20</span>
            </div>

            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-kindred-primary text-white text-[13px] font-medium hover:bg-orange-600 transition-colors"
            >
              <SquarePen className="w-4 h-4" />
              <span>Post</span>
            </button>
            
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted
                const connected = ready && account && chain

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Connect
                          </button>
                        )
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            className="flex items-center gap-1 px-2 py-1.5 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg text-xs text-[#adadb0] hover:bg-[#222] transition-colors"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <img src={chain.iconUrl} alt={chain.name ?? 'Chain'} className="w-4 h-4 rounded-full" />
                            )}
                          </button>
                          <button
                            onClick={() => router.push(`/passport/${account.address}`)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg text-sm text-white hover:bg-[#222] hover:border-purple-500/50 transition-colors"
                          >
                            <span className="text-purple-400">🦞</span>
                            {account.displayName}
                          </button>
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>

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

      <CreateReviewModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}
