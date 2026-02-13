import { Metadata } from 'next'
import SwapInterfaceV2 from './SwapInterfaceV2'

export const metadata: Metadata = {
  title: 'Swap | Maat',
  description: 'Swap tokens with reputation-based dynamic fees. High trust = low fees. Protected by Anti-MEV priority queue.',
}

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hook Swap
            <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-lg">
              Uniswap v4
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Swap with reputation-based fees. High trust users get immediate execution 
            with maximum MEV protection.
          </p>
        </div>
        
        <SwapInterfaceV2 />
      </div>
    </div>
  )
}
