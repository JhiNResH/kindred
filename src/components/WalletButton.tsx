'use client'

import { useState, useEffect, useRef } from 'react'
import { useIsMounted } from './ClientOnly'
import { LogOut, Copy, Check, Wallet, ExternalLink, ChevronDown, Shield } from 'lucide-react'
import { formatEther } from 'viem'
import { useAccount, useDisconnect, useConnect, usePublicClient } from 'wagmi'
import { useSmartAccount } from '@/hooks/useSmartAccount'
import { injected } from 'wagmi/connectors'

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
  
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const { smartAccount, isLoading: isCreatingSmartAccount } = useSmartAccount()

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
    if (!address) return

    const fetchBalances = async () => {
      try {
        const ethResponse = await fetch('/api/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        })

        if (ethResponse.ok) {
          const data = await ethResponse.json()
          setEthBalance(data.eth || '0.0000')
          setUsdcBalance(data.usdc || '0.00')
        } else if (publicClient) {
          const ethBal = await publicClient.getBalance({ address })
          setEthBalance(parseFloat(formatEther(ethBal)).toFixed(4))
        }
      } catch (error) {
        console.error('[WalletButton] Failed to fetch balances:', error)
        setEthBalance('0.0000')
        setUsdcBalance('0.00')
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 30000)
    return () => clearInterval(interval)
  }, [address, publicClient])

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openExplorer = () => {
    if (!address) return
    window.open(`https://sepolia.basescan.org/address/${address}`, '_blank')
  }

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  if (!isMounted) {
    return (
      <button className="px-5 py-2.5 rounded-lg bg-[#1f1f23] animate-pulse">
        <span className="invisible">Connect Wallet</span>
      </button>
    )
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
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
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold relative">
          {smartAccount ? <Shield className="w-4 h-4" /> : 'W'}
          {isCreatingSmartAccount && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          )}
        </div>
        <span className="text-sm">
          {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Wallet'}
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
                {smartAccount ? <Shield className="w-6 h-6 text-white" /> : <Wallet className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">
                  {smartAccount ? 'Smart Account' : 'EOA Wallet'}
                </div>
                <div className="text-sm font-mono text-white">
                  {smartAccount 
                    ? `${smartAccount.address.slice(0, 6)}...${smartAccount.address.slice(-6)}`
                    : address ? `${address.slice(0, 6)}...${address.slice(-6)}` : 'Not connected'
                  }
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
          {showBalance && address && (
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
            {address && (
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
                disconnect()
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
