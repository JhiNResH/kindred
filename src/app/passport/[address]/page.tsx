'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Share2, Copy, ChevronRight, ExternalLink, Flame } from 'lucide-react'
import {
  TIERS,
  ACHIEVEMENTS,
  EXP_REWARDS,
  getExpProgress,
  getUnlockedAchievements,
  type UserStats
} from '@/lib/expSystem'

// Maat brand colors (matching logo)
const COLORS = {
  deepPurple: '#7B5B9A',
  lavender: '#B8B0C8',
  darkBg: '#0a0a0b',
  cardBg: '#111113',
  border: '#1f1f23',
}

export default function PassportPage({ params }: { params: Promise<{ address: string }> }) {
  const router = useRouter()
  const [address, setAddress] = useState<string | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null)

  // Resolve async params
  useEffect(() => {
    params.then(p => setAddress(p.address))
  }, [params])

  useEffect(() => {
    if (!address) return

    async function fetchStats() {
      try {
        const res = await fetch(`/api/users/${address}/stats`)
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Set default "New explorer" stats
        setStats({
          exp: 0,
          reputation: 0,
          reviewCount: 0,
          verifiedReviews: 0,
          totalStaked: 0,
          totalUpvotes: 0,
          currentStreak: 0,
          longestStreak: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [address])

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheckIn = async () => {
    if (checkingIn) return
    setCheckingIn(true)
    setCheckInMessage(null)

    try {
      const res = await fetch(`/api/users/${address!}/stats`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        setCheckInMessage(`+${data.expGained} EXP! ${data.message}`)
        if (stats) {
          setStats({
            ...stats,
            exp: stats.exp + data.expGained,
            currentStreak: data.currentStreak,
            longestStreak: Math.max(stats.longestStreak, data.currentStreak),
          })
        }
      } else {
        setCheckInMessage(data.message || 'Check-in failed')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      setCheckInMessage('Check-in failed')
    } finally {
      setCheckingIn(false)
      setTimeout(() => setCheckInMessage(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.jpg" alt="Loading" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-[#B8B0C8]">Loading passport...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load passport</p>
        </div>
      </div>
    )
  }

  const { current: currentTier, next: nextTier, progress, remaining } = getExpProgress(stats.exp)
  const unlockedAchievements = getUnlockedAchievements(stats)
  const shortAddress = `${address!.slice(0, 6)}...${address!.slice(-4)}`

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-10 px-6">
      {/* Subtle gradient background matching logo colors */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#7B5B9A]/5 via-transparent to-[#B8B0C8]/5 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          {/* Logo with glow effect */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B5B9A] to-[#B8B0C8] blur-2xl opacity-30 scale-150" />
            <div className="relative w-32 h-32 rounded-2xl bg-[#0a0a0b] border border-[#7B5B9A]/30 flex items-center justify-center overflow-hidden"
                 style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}>
              <img
                src="/logo.jpg"
                alt="Maat"
                className="w-28 h-28 object-contain"
              />
            </div>
          </div>

          {/* Tier Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-[#7B5B9A]/20 to-[#B8B0C8]/20 border border-[#7B5B9A]/30 mb-4">
            <span className="text-2xl">{currentTier.icon}</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B8B0C8] to-[#7B5B9A] bg-clip-text text-transparent">
              {currentTier.name}
            </h1>
          </div>

          {/* Address */}
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 mx-auto text-[#B8B0C8]/60 hover:text-[#B8B0C8] transition-colors group"
          >
            <span className="font-mono text-base">{shortAddress}</span>
            <Copy className="w-4 h-4 group-hover:text-[#7B5B9A]" />
          </button>
          {copied && <p className="text-[#7B5B9A] text-sm mt-2">Copied!</p>}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Main Stats Card - Angular design */}
            <div className="relative bg-[#111113] border border-[#7B5B9A]/20 rounded-2xl p-8 overflow-hidden"
                 style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%)' }}>
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#7B5B9A]/20 to-transparent" />

              {/* EXP & Reputation */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#B8B0C8]/50 uppercase mb-2">Experience</p>
                  <p className="text-5xl font-bold text-white">{stats.exp} <span className="text-lg text-[#7B5B9A]">EXP</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold tracking-widest text-[#B8B0C8]/50 uppercase mb-2">Reputation</p>
                  <p className="text-5xl font-bold text-[#B8B0C8]">{stats.reputation}</p>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {nextTier && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-[#B8B0C8]/60">
                      Progress to {nextTier.icon} {nextTier.name}
                    </span>
                    <span className="text-sm text-[#7B5B9A] font-medium">
                      {remaining} EXP to go
                    </span>
                  </div>
                  <div className="h-3 bg-[#1a1a1d] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7B5B9A] to-[#B8B0C8] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 py-6 border-y border-[#7B5B9A]/10">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{stats.reviewCount}</p>
                  <p className="text-xs text-[#B8B0C8]/50 uppercase mt-1">Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#7B5B9A]">{stats.verifiedReviews}</p>
                  <p className="text-xs text-[#B8B0C8]/50 uppercase mt-1">Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#B8B0C8]">{stats.totalStaked.toLocaleString()}</p>
                  <p className="text-xs text-[#B8B0C8]/50 uppercase mt-1">Staked</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">{stats.totalUpvotes}</p>
                  <p className="text-xs text-[#B8B0C8]/50 uppercase mt-1">Upvotes</p>
                </div>
              </div>

              {/* Streak */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7B5B9A]/20 to-[#B8B0C8]/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-[#7B5B9A]" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">{stats.currentStreak} day streak</p>
                    <p className="text-sm text-[#B8B0C8]/50">Best: {stats.longestStreak} days</p>
                  </div>
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="px-6 py-3 bg-gradient-to-r from-[#7B5B9A] to-[#7B5B9A]/80 hover:from-[#8B6BAA] hover:to-[#7B5B9A] text-white font-medium rounded-lg transition-all disabled:opacity-50"
                  style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                >
                  {checkingIn ? 'Checking in...' : 'Check In'}
                </button>
              </div>
              {checkInMessage && (
                <p className="mt-3 text-sm text-center text-[#7B5B9A]">{checkInMessage}</p>
              )}
            </div>

            {/* Tier Perks */}
            {currentTier.perks.length > 0 && (
              <div className="bg-[#111113] border border-[#7B5B9A]/20 rounded-2xl p-6">
                <h3 className="text-sm font-bold tracking-widest text-[#B8B0C8]/50 uppercase mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-[#7B5B9A] to-[#B8B0C8] rounded-full" />
                  {currentTier.icon} {currentTier.name} Perks
                </h3>
                <div className="space-y-3">
                  {currentTier.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3 text-base text-[#B8B0C8]">
                      <span className="text-[#7B5B9A]">&#10003;</span>
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXP Guide */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-2xl p-6">
              <h3 className="text-sm font-bold tracking-widest text-[#B8B0C8]/50 uppercase mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-[#7B5B9A] to-[#B8B0C8] rounded-full" />
                How to Earn EXP
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { action: 'WRITE_REVIEW', icon: '📝' },
                  { action: 'VERIFIED_USER_REVIEW', icon: '✅' },
                  { action: 'STAKE_HIGH', icon: '💰' },
                  { action: 'DAILY_CHECK_IN', icon: '📅' },
                ].map(({ action, icon }) => {
                  const reward = EXP_REWARDS[action as keyof typeof EXP_REWARDS]
                  return (
                    <div key={action} className="flex items-center gap-4 p-4 bg-[#0a0a0b] rounded-xl border border-[#7B5B9A]/10 hover:border-[#7B5B9A]/30 transition-colors">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{reward.description}</p>
                        <p className="text-sm text-[#7B5B9A] font-bold">+{reward.exp} EXP</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold tracking-widest text-[#B8B0C8]/50 uppercase flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-[#7B5B9A] to-[#B8B0C8] rounded-full" />
                  Achievements
                </h3>
                <span className="text-sm text-[#7B5B9A] font-medium">
                  {unlockedAchievements.length}/{ACHIEVEMENTS.length} Unlocked
                </span>
              </div>
              <div className="space-y-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const unlocked = achievement.check(stats)
                  const value = achievement.getValue(stats)
                  const progressPercent = Math.min(100, (value / achievement.target) * 100)

                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        unlocked
                          ? 'bg-gradient-to-r from-[#7B5B9A]/10 to-[#B8B0C8]/10 border-[#7B5B9A]/30'
                          : 'bg-[#0a0a0b] border-[#1f1f23] hover:border-[#7B5B9A]/20'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        unlocked
                          ? 'bg-gradient-to-br from-[#7B5B9A]/30 to-[#B8B0C8]/30'
                          : 'bg-[#1a1a1d]'
                      }`}>
                        <span className="text-2xl">{unlocked ? achievement.icon : '🔒'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-base font-medium ${unlocked ? 'text-white' : 'text-[#B8B0C8]/50'}`}>
                            {achievement.label}
                          </p>
                          {unlocked ? (
                            <span className="text-sm text-[#7B5B9A] font-medium">&#10003; Unlocked</span>
                          ) : (
                            <span className="text-sm text-[#B8B0C8]/40">
                              {value}/{achievement.target}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#B8B0C8]/40">{achievement.desc}</p>
                        {!unlocked && (
                          <div className="mt-2 h-1.5 bg-[#1a1a1d] rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#7B5B9A]/50 to-[#B8B0C8]/50"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* My Reviews Link */}
            <Link
              href={`/reviews?author=${address!}`}
              className="flex items-center justify-between p-5 bg-[#111113] border border-[#1f1f23] rounded-xl hover:border-[#7B5B9A]/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7B5B9A]/20 to-[#B8B0C8]/20 flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <p className="text-base font-medium text-white">{stats.reviewCount} Reviews</p>
                  <p className="text-sm text-[#B8B0C8]/50">View all my reviews</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-[#B8B0C8]/30 group-hover:text-[#7B5B9A] transition-colors" />
            </Link>

            {/* Share Button */}
            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7B5B9A] to-[#7B5B9A]/80 hover:from-[#8B6BAA] hover:to-[#7B5B9A] text-white text-lg font-medium rounded-xl transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share Passport
              </button>
              <a
                href={`https://basescan.org/address/${address!}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-5 py-4 bg-[#111113] border border-[#1f1f23] hover:border-[#7B5B9A]/30 text-[#B8B0C8] rounded-xl transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-[#B8B0C8]/30">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#7B5B9A]/30" />
            <p className="text-sm italic">
              "Your reputation is built one honest review at a time."
            </p>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#B8B0C8]/30" />
          </div>
        </div>
      </div>
    </div>
  )
}
