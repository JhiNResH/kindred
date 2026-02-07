import { Metadata } from 'next'
import { SwapInterface } from './SwapInterface'

export const metadata: Metadata = {
  title: 'Hook Swap - Kindred',
  description: 'Dynamic fee swaps powered by reputation. Higher reputation = lower fees.',
  openGraph: {
    title: 'Kindred Hook Swap - Reputation-Based Dynamic Fees',
    description: 'Experience Uniswap v4 dynamic fees powered by your on-chain reputation',
    type: 'website',
  },
}

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-2xl">🔄</span>
            <span className="text-sm font-medium text-blue-300">Kindred Hook Swap</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Reputation-Based Dynamic Fees
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The first Uniswap v4 Hook that rewards your on-chain reputation with lower swap fees
          </p>
        </div>

        <SwapInterface />

        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">How KindredHook Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2 text-green-400">1. Build Reputation</h3>
              <p className="text-gray-400 text-sm">
                Write quality reviews, stake tokens, and earn upvotes to increase your reputation score (0-1000).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-2 text-blue-400">2. Swap with Hook</h3>
              <p className="text-gray-400 text-sm">
                Connect your wallet and swap tokens. KindredHook automatically checks your reputation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2 text-purple-400">3. Save on Fees</h3>
              <p className="text-gray-400 text-sm">
                Higher reputation = lower fees! Top users pay only 0.15% instead of the standard 0.30%.
              </p>
            </div>
          </div>
        </div>

        {/* Fee Tiers */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Fee Tiers</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* High Trust */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                BEST
              </div>
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold mb-2 text-green-400">High Trust</h3>
              <div className="text-4xl font-bold mb-2 text-green-300">0.15%</div>
              <p className="text-sm text-gray-400 mb-4">Score ≥ 850</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>✓ 50% fee discount</li>
                <li>✓ Priority support</li>
                <li>✓ Elite status</li>
              </ul>
            </div>

            {/* Medium Trust */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold mb-2 text-blue-400">Medium Trust</h3>
              <div className="text-4xl font-bold mb-2 text-blue-300">0.22%</div>
              <p className="text-sm text-gray-400 mb-4">Score 600-849</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>✓ 27% fee discount</li>
                <li>✓ Standard support</li>
                <li>✓ Verified status</li>
              </ul>
            </div>

            {/* Low Trust */}
            <div className="bg-gradient-to-br from-gray-900/20 to-slate-900/20 border border-gray-500/30 rounded-xl p-6">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-400">Low Trust</h3>
              <div className="text-4xl font-bold mb-2 text-gray-300">0.30%</div>
              <p className="text-sm text-gray-400 mb-4">Score 100-599</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>✓ Standard rate</li>
                <li>✓ Build reputation</li>
                <li>✓ Unlock discounts</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
            <p className="text-yellow-300">
              💡 <strong>Pro Tip:</strong> Score below 100? You'll need to build reputation before trading. 
              Start by writing quality reviews and staking tokens!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
