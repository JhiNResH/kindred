'use client'

import { useIsMounted } from '@/components/layout/ClientOnly'
import { LogOut } from 'lucide-react'

// Conditionally import Privy to avoid errors when not configured
let usePrivy: any
try {
  const privy = require('@privy-io/react-auth')
  usePrivy = privy.usePrivy
} catch {
  usePrivy = () => ({ login: () => {}, logout: () => {}, authenticated: false, user: null })
}

interface WalletButtonProps {
  variant?: 'default' | 'large' | 'minimal'
  showBalance?: boolean
}

export function WalletButton({ variant = 'default', showBalance = true }: WalletButtonProps) {
  const isMounted = useIsMounted()
  
  // Safely call usePrivy - returns defaults if Privy not configured
  let privyState = { login: () => {}, logout: () => {}, authenticated: false, user: null as any }
  try {
    privyState = usePrivy()
  } catch {
    // Privy not available, use defaults
  }
  
  const { login, authenticated, user, logout } = privyState

  if (!isMounted) {
    return (
      <button className="px-5 py-2.5 rounded-lg bg-[#1f1f23] animate-pulse">
        <span className="invisible">Connect Wallet</span>
      </button>
    )
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className={`font-bold transition-all text-black ${
          variant === 'large'
            ? 'px-8 py-4 text-lg rounded-xl bg-[#ded4e8] hover:bg-[#c4b9d3] hover:shadow-xl hover:shadow-purple-500/20'
            : variant === 'minimal'
            ? 'px-4 py-2 text-sm rounded-lg bg-transparent border border-[#2a2a2e] text-[#adadb0] hover:bg-[#111113] hover:text-white'
            : 'px-5 py-2.5 rounded-lg bg-[#ded4e8] hover:bg-[#c4b9d3] hover:shadow-lg hover:shadow-purple-500/20'
        }`}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Wallet Display */}
      <button
        onClick={logout}
        className={`flex items-center gap-2 font-medium transition-all group ${
          variant === 'large'
            ? 'px-6 py-3 text-base rounded-xl bg-[#111113] border border-[#2a2a2e] text-white hover:bg-[#1a1a1d]'
            : 'px-4 py-2 rounded-lg bg-[#111113] border border-[#1f1f23] text-white hover:bg-[#1a1a1d]'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
          {user?.wallet ? 'W' : user?.email ? 'E' : 'U'}
        </div>
        <span className="text-sm">
          {user?.wallet 
            ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
            : user?.email?.address || 'User'}
        </span>
        <LogOut className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#6b6b70] hover:text-red-400" />
      </button>
    </div>
  )
}
