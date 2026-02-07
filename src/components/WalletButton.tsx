'use client'

import { useState, useEffect, useRef } from 'react'
import { useIsMounted } from './ClientOnly'
import { LogOut, Copy, Check, Wallet, ExternalLink, ChevronDown } from 'lucide-react'
import { formatEther } from 'viem'
import { usePublicClient } from 'wagmi'
import { baseSepolia } from 'viem/chains'

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
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ethBalance, setEthBalance] = useState<string | null>(null)
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const publicClient = usePublicClient()
  
  // Safely call usePrivy - returns defaults if Privy not configured
  let privyState = { login: () => {}, logout: () => {}, authenticated: false, user: null as any }
  try {
    privyState = usePrivy()
  } catch {
    // Privy not available, use defaults
  }
  
  const { login, authenticated, user, logout } = privyState
  
  const walletAddress = user?.wallet?.address as `0x${string}` | undefined

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch balances when wallet connected
  useEffect(() => {
    if (!walletAddress) {
      console.log('[WalletButton] No wallet address')
      return
    }

    const fetchBalances = async () => {
      try {
        console.log('[WalletButton] Fetching balances for:', walletAddress)

        // Fetch ETH balance via direct RPC call
        const ethResponse = await fetch('/api/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: walletAddress }),
        })

        if (ethResponse.ok) {
          const data = await ethResponse.json()
          setEthBalance(data.eth || '0.0000')
          setUsdcBalance(data.usdc || '0.00')
          console.log('[WalletButton] Balances fetched:', data)
        } else {
          console.error('[WalletButton] Balance API failed:', await ethResponse.text())
          // Fallback: try publicClient directly
          if (publicClient) {
            const ethBal = await publicClient.getBalance({ address: walletAddress })
            setEthBalance(parseFloat(formatEther(ethBal)).toFixed(4))
          }
        }
      } catch (error) {
        console.error('[WalletButton] Failed to fetch balances:', error)
        setEthBalance('0.0000')
        setUsdcBalance('0.00')
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [walletAddress, publicClient])

  const copyAddress = async () => {
    if (!walletAddress) return
    await navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openExplorer = () => {
    if (!walletAddress) return
    window.open(`https://sepolia.basescan.org/address/${walletAddress}`, '_blank')
  }

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
    <div className="relative" ref={dropdownRef}>
      {/* Wallet Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 font-medium transition-all ${
          variant === 'large'
            ? 'px-6 py-3 text-base rounded-xl bg-[#111113] border border-[#2a2a2e] text-white hover:bg-[#1a1a1d]'
            : 'px-4 py-2 rounded-lg bg-[#111113] border border-[#1f1f23] text-white hover:bg-[#1a1a1d]'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
          {user?.wallet ? 'W' : user?.email ? 'E' : 'U'}
        </div>
        <span className="text-sm">
          {walletAddress 
            ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
            : user?.email?.address || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111113] border border-[#2a2a2e] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-[#2a2a2e] p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Your Wallet</div>
                <div className="text-sm font-mono text-white">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'Not connected'}
                </div>
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="px-4 py-3 border-b border-[#2a2a2e] flex items-center justify-between">
            <span className="text-xs text-gray-400">Network</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-sm font-medium text-white">Base Sepolia</span>
            </div>
          </div>

          {/* Balances */}
          {showBalance && walletAddress && (
            <div className="p-4 border-b border-[#2a2a2e]">
              <div className="text-xs text-gray-400 mb-3">Balances</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">ETH</span>
                  <span className="text-sm font-medium text-white">
                    {ethBalance !== null ? `${ethBalance} ETH` : '...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">USDC</span>
                  <span className="text-sm font-medium text-white">
                    {usdcBalance !== null ? `$${usdcBalance}` : '...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-2">
            {walletAddress && (
              <>
                <button
                  onClick={copyAddress}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1d] transition-colors text-left"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-white">
                    {copied ? 'Copied!' : 'Copy Address'}
                  </span>
                </button>
                <button
                  onClick={openExplorer}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1d] transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white">View on Explorer</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left mt-1"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
