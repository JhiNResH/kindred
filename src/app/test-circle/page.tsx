/**
 * Circle Wallet Test Page
 * For testing Circle integration during development
 */

'use client'

import { useState } from 'react'
import { useCircleWallet, useGaslessTransaction } from '@/hooks/useCircleWallet'
import { getCircleConfigStatus } from '@/lib/circle/config'

export default function TestCirclePage() {
  const [userId, setUserId] = useState('')
  const [testMessage, setTestMessage] = useState('Hello from Circle!')
  const [testTxTo, setTestTxTo] = useState('0x0000000000000000000000000000000000000000')
  const [testTxData, setTestTxData] = useState('0x')
  
  const circleWallet = useCircleWallet(userId)
  const gasless = useGaslessTransaction()
  const config = getCircleConfigStatus()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Circle Wallet Test</h1>
          <p className="text-gray-400">Test Circle Programmable Wallets integration</p>
        </div>

        {/* Configuration Status */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Configuration Status</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">API Key</div>
              <div className={config.apiKeyConfigured ? 'text-green-400' : 'text-red-400'}>
                {config.apiKeyConfigured ? '✅ Configured' : '❌ Not Configured'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Client Key</div>
              <div className={config.clientKeyConfigured ? 'text-green-400' : 'text-red-400'}>
                {config.clientKeyConfigured ? '✅ Configured' : '❌ Not Configured'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Chain</div>
              <div>{config.chain}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Chain ID</div>
              <div>{config.chainId}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Paymaster</div>
              <div className={config.paymasterEnabled ? 'text-green-400' : 'text-gray-400'}>
                {config.paymasterEnabled ? '✅ Enabled' : '❌ Disabled'}
              </div>
            </div>
          </div>
        </div>

        {/* User ID Input */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">User ID</h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID (address or username)"
              className="flex-1 bg-gray-700 rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => circleWallet.loadWallets(userId)}
              disabled={!userId || circleWallet.loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-semibold transition"
            >
              Load Wallets
            </button>
          </div>
          
          {circleWallet.error && (
            <div className="text-red-400 text-sm">{circleWallet.error}</div>
          )}
        </div>

        {/* Wallet Info */}
        {circleWallet.wallet && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">Active Wallet</h2>
            
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-400">Address</div>
                <div className="font-mono">{circleWallet.wallet.address}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Wallet ID</div>
                <div className="font-mono text-sm">{circleWallet.wallet.id}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Balance</div>
                <div>{circleWallet.balance} wei</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">State</div>
                <div className="text-green-400">{circleWallet.wallet.state}</div>
              </div>
            </div>
          </div>
        )}

        {/* Create Wallet */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Create Wallet</h2>
          
          <button
            onClick={() => circleWallet.createWallet(userId || 'test-user')}
            disabled={circleWallet.loading || !circleWallet.isConfigured}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            {circleWallet.loading ? 'Creating...' : 'Create New Wallet'}
          </button>
          
          {!circleWallet.isConfigured && (
            <div className="text-yellow-400 text-sm">
              ⚠️ Circle not configured. Add API keys to .env.local
            </div>
          )}
        </div>

        {/* Sign Message */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Sign Message</h2>
          
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Message to sign"
            className="w-full bg-gray-700 rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          
          <button
            onClick={async () => {
              const sig = await circleWallet.sign(testMessage)
              if (sig) {
                alert(`Signature: ${sig}`)
              }
            }}
            disabled={!circleWallet.wallet || circleWallet.loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            Sign Message
          </button>
        </div>

        {/* Test Transaction */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Test Transaction</h2>
          
          <div className="space-y-2">
            <input
              type="text"
              value={testTxTo}
              onChange={(e) => setTestTxTo(e.target.value)}
              placeholder="To address"
              className="w-full bg-gray-700 rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
            />
            
            <input
              type="text"
              value={testTxData}
              onChange={(e) => setTestTxData(e.target.value)}
              placeholder="Call data (0x...)"
              className="w-full bg-gray-700 rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const txHash = await circleWallet.executeTransaction({
                  to: testTxTo,
                  data: testTxData,
                })
                if (txHash) {
                  alert(`Transaction sent: ${txHash}`)
                }
              }}
              disabled={!circleWallet.wallet || circleWallet.loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Send Transaction
            </button>
            
            <button
              onClick={async () => {
                if (!circleWallet.wallet) return
                
                const txHash = await gasless.executeGasless({
                  walletId: circleWallet.wallet.id,
                  to: testTxTo,
                  data: testTxData,
                  operation: 'test',
                })
                if (txHash) {
                  alert(`Gasless transaction sent: ${txHash}`)
                }
              }}
              disabled={!circleWallet.wallet || gasless.sponsoring}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              {gasless.sponsoring ? 'Sponsoring...' : 'Send Gasless'}
            </button>
          </div>
        </div>

        {/* All Wallets */}
        {circleWallet.wallets.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">All Wallets ({circleWallet.wallets.length})</h2>
            
            <div className="space-y-2">
              {circleWallet.wallets.map((w: any) => (
                <div
                  key={w.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="font-mono text-sm">{w.address}</div>
                  <div className="text-xs text-gray-400 mt-1">{w.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
