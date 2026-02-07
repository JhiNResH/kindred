/**
 * Circle Wallet Connect Button
 * Alternative to RainbowKit for Circle wallet users
 */

'use client'

import { useState } from 'react'
import { useCircleWallet } from '@/hooks/useCircleWallet'

export function CircleWalletButton() {
  const [showModal, setShowModal] = useState(false)
  const [username, setUsername] = useState('')
  const circleWallet = useCircleWallet()

  const handleConnect = async () => {
    if (!username) return
    
    // Try to load existing wallets first
    await circleWallet.loadWallets(username)
    
    // If no wallets, create one
    if (circleWallet.wallets.length === 0) {
      await circleWallet.createWallet(username)
    }
    
    setShowModal(false)
  }

  if (!circleWallet.isConfigured) {
    return null // Don't show if Circle not configured
  }

  if (circleWallet.wallet) {
    return (
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
        <div className="w-2 h-2 bg-green-400 rounded-full" />
        <div className="font-mono text-sm">
          {circleWallet.wallet.address.slice(0, 6)}...{circleWallet.wallet.address.slice(-4)}
        </div>
        <div className="text-xs text-gray-400">
          {circleWallet.balance.slice(0, 8)} ETH
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        Connect Circle Wallet
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Connect Circle Wallet</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Username or Wallet Address
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleConnect}
                  disabled={!username || circleWallet.loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {circleWallet.loading ? 'Connecting...' : 'Connect'}
                </button>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
              
              {circleWallet.error && (
                <div className="text-red-400 text-sm">{circleWallet.error}</div>
              )}
              
              <div className="text-xs text-gray-500">
                🔒 Your wallet is secured by Circle&apos;s MPC technology.
                No private keys stored on this device.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
