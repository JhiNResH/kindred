import { Metadata } from 'next'
import { KindClawFaucet } from '@/components/KindClawFaucet'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'KINDCLAW Faucet - Kindred',
  description: 'Claim free KINDCLAW tokens for the Clawathon hackathon',
}

export default function FaucetPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white pt-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-2xl">💧</span>
            <span className="text-sm font-medium text-purple-300">Testnet Faucet</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
            KINDCLAW Faucet
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Get free KINDCLAW tokens to participate in Clawathon hackathon demos
          </p>
        </div>

        {/* Faucet Component */}
        <KindClawFaucet />

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="font-semibold text-white mb-1">Arcade Token</h3>
            <p className="text-sm text-gray-400">
              KINDCLAW is a testnet token for demos. Free to claim, easy to use.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold text-white mb-1">Stake to Comment</h3>
            <p className="text-sm text-gray-400">
              Use KINDCLAW to create reviews and participate in the reputation system.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl mb-2">🗳️</div>
            <h3 className="font-semibold text-white mb-1">Vote on Content</h3>
            <p className="text-sm text-gray-400">
              Upvote and downvote with KINDCLAW. Higher stakes = more weight.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-300">FAQ</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-white">Why can't I claim again?</strong>
              <p className="text-gray-400 mt-1">There's a 1-hour cooldown between claims to prevent spam.</p>
            </div>
            <div>
              <strong className="text-white">Is this real money?</strong>
              <p className="text-gray-400 mt-1">No, KINDCLAW is a testnet token with no real value. It's only for demos.</p>
            </div>
            <div>
              <strong className="text-white">What happens after the hackathon?</strong>
              <p className="text-gray-400 mt-1">
                KINDCLAW may be upgraded to a governance token if we launch. Early users will be considered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
