'use client'

import { FaucetButton } from '@/components/FaucetButton'
import { Droplets } from 'lucide-react'

export default function FaucetPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <Droplets className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            $KINDCLAW Faucet
          </h1>
          <p className="text-gray-400 mt-2">
            Claim free $KINDCLAW tokens to start reviewing and voting
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Amount per claim</p>
            <p className="text-4xl font-bold">1,000 <span className="text-purple-400">KINDCLAW</span></p>
          </div>

          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Cooldown</span>
              <span>1 hour</span>
            </div>
            <div className="flex justify-between">
              <span>Network</span>
              <span>Base Sepolia</span>
            </div>
          </div>

          <FaucetButton />
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>$KINDCLAW is an arcade token for the Kindred platform</p>
          <p>Use it to stake reviews, upvote content, and earn rewards</p>
        </div>
      </div>
    </div>
  )
}
