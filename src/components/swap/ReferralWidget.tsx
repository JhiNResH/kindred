'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Gift, Users, Copy, Check } from 'lucide-react'

interface ReferralWidgetProps {
  reputation: number
}

export function ReferralWidget({ reputation }: ReferralWidgetProps) {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const canRefer = reputation >= 700
  const referralUrl = `https://kindred.app/?ref=${address}`

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!canRefer) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">Referral Program</h3>
            <p className="text-xs text-slate-400">
              Reach 700 reputation to earn 20% of fees from referrals
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{reputation}/700</div>
            <div className="w-20 h-1 bg-black/40 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${(reputation / 700) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Referral Program Active</h3>
          <p className="text-xs text-purple-300">Earn 20% of fees from every referral</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Referral Link */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Your Referral Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white font-mono truncate"
            />
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-3 bg-black/40 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-slate-400">Referrals</span>
            </div>
            <div className="text-lg font-bold text-white">0</div>
          </div>
          <div className="p-3 bg-black/40 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs text-slate-400">Earned</span>
            </div>
            <div className="text-lg font-bold text-white">$0.00</div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-3 p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-slate-300">
            <strong>How it works:</strong> Share your link with friends. When they trade, you earn 20%
            of their swap fees. Your reputation increases with each successful referral (+10 points).
          </p>
        </div>
      </div>
    </div>
  )
}
