'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { WalletButton } from '@/components/WalletButton'
import { useDRONE } from '@/hooks/useDRONE'

const DRONE_ADDRESS = process.env.NEXT_PUBLIC_DRONE_ADDRESS as `0x${string}`

export default function DRONEFaucetPage() {
  const { isConnected, address } = useAccount()
  const { claimFaucet, isLoading, error } = useDRONE(DRONE_ADDRESS)
  const [claimed, setClaimed] = useState(false)

  const handleClaim = async () => {
    const success = await claimFaucet()
    if (success) {
      setClaimed(true)
      setTimeout(() => setClaimed(false), 3000)
    }
  }

  return (
    <main className="min-h-screen bg-kindred-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🦞</span>
          <span className="text-xl font-bold">Kindred</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/faucet" className="text-gray-400 hover:text-white transition">
            KINDCLAW Faucet
          </Link>
          <WalletButton />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-white">DRONE Faucet</span>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🚁</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">DRONE Token Faucet</h1>
              <p className="text-gray-300 mb-4">
                領取免費的 DRONE 代幣用於評論和投票質押。
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>✓ 每 24 小時可領取 100 DRONE</p>
                <p>✓ 用於在 Kindred 評論、投票和質押</p>
                <p>✓ 建立聲譽並獲得獎勵</p>
              </div>
            </div>
          </div>
        </div>

        {/* Faucet Card */}
        <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">領取 DRONE</h2>

          {!isConnected ? (
            <div className="text-center">
              <p className="text-gray-400 mb-4">請先連接錢包</p>
              <WalletButton />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-[#1a1a1d] rounded-lg">
                <span className="text-xl">👛</span>
                <div>
                  <p className="text-sm text-gray-400">你的地址</p>
                  <p className="font-mono text-sm text-gray-300">{address}</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {claimed && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  ✓ 成功！100 DRONE 已發送到你的錢包
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isLoading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isLoading ? '正在領取...' : '領取 100 DRONE'}
              </button>

              <div className="text-sm text-gray-400">
                <p className="mb-2">💡 提示：</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>每個地址每 24 小時可領取一次</li>
                  <li>領取後用於評論和投票</li>
                  <li>質押越多 DRONE 聲譽分越高</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* How to Use */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>✍️</span>
              寫評論
            </h3>
            <ol className="text-sm text-gray-400 space-y-2">
              <li>1. 訪問任何項目頁面</li>
              <li>2. 點擊「Write Review」</li>
              <li>3. 選擇 DRONE 質押金額</li>
              <li>4. 提交評論</li>
            </ol>
          </div>

          <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>🗳️</span>
              投票
            </h3>
            <ol className="text-sm text-gray-400 space-y-2">
              <li>1. 訪問項目詳細頁面</li>
              <li>2. 側邊欄選擇 Bullish 或 Bearish</li>
              <li>3. 選擇 DRONE 質押</li>
              <li>4. 提交投票</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 mt-12">
        <p>Built with 🦞 by Team Kindred</p>
      </footer>
    </main>
  )
}
