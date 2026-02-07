'use client'

import { useState, useEffect } from 'react'
import { UnlockButton } from '@/components/x402/UnlockButton'
import { TrendingUp, TrendingDown, Clock, DollarSign, Star, Users, Award, AlertTriangle } from 'lucide-react'
import { useAccount } from 'wagmi'

interface InsightReport {
  overall_score: number
  trend: 'improving' | 'stable' | 'declining'
  trend_data: number[]
  best_time: string
  value_rating: string
  strengths: string[]
  weaknesses: string[]
  competitor_comparison: {
    rank: number
    total: number
    area: string
  }
  recommendation: string
  peak_hours: string[]
  avg_wait_time: string
  cuisine_tags: string[]
  price_range: string
}

interface PremiumInsightProps {
  restaurantId: string
  restaurantName: string
}

export function PremiumInsight({ restaurantId, restaurantName }: PremiumInsightProps) {
  const { address, isConnected } = useAccount()
  const [report, setReport] = useState<InsightReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [restaurantId, address])

  const checkAccess = async () => {
    if (!isConnected || !address) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `/api/gourmet/insight?restaurantId=${restaurantId}&address=${address}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'unlocked') {
          setReport(data.report)
          setHasAccess(true)
        }
      }
    } catch (error) {
      console.error('[PremiumInsight] Check access error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async (content: any) => {
    console.log('[PremiumInsight] Unlock callback received:', content)
    
    // If content has report, use it
    if (content?.report) {
      setReport(content.report)
      setHasAccess(true)
      return
    }
    
    // Otherwise, fetch from insight API
    if (!address) return
    
    try {
      const response = await fetch('/api/gourmet/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
          userAddress: address,
          txHash: content.txHash || 'manual-unlock',
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('[PremiumInsight] Insight fetched:', data)
        setReport(data.report)
        setHasAccess(true)
      } else {
        console.error('[PremiumInsight] Failed to fetch insight:', await response.text())
      }
    } catch (error) {
      console.error('[PremiumInsight] Fetch error:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Premium Restaurant Insight</h3>
            <p className="text-sm text-gray-400">
              Unlock AI-powered deep analysis for <span className="text-white font-semibold">{restaurantName}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Trend Analysis</div>
            <div className="text-sm text-white font-medium">6-month data</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Best Time</div>
            <div className="text-sm text-white font-medium">Peak hours</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Value Rating</div>
            <div className="text-sm text-white font-medium">CP值分析</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Competition</div>
            <div className="text-sm text-white font-medium">Local rank</div>
          </div>
        </div>

        <UnlockButton
          contentId={`insight:${restaurantId}`}
          contentType="gourmet-insight"
          price="0.10"
          onUnlock={handleUnlock}
        />
      </div>
    )
  }

  if (!report) {
    return null
  }

  const trendIcon = report.trend === 'improving' ? TrendingUp : TrendingDown
  const trendColor = report.trend === 'improving' ? 'text-green-400' : 'text-red-400'
  const TrendIcon = trendIcon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Premium Insight Unlocked</h3>
        </div>
        <p className="text-sm text-gray-400">
          AI-powered analysis for <span className="text-white font-semibold">{restaurantName}</span>
        </p>
      </div>

      {/* Overall Score & Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Overall Score</div>
              <div className="text-4xl font-bold text-white">{report.overall_score.toFixed(1)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Trend</div>
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-5 h-5" />
                <span className="text-sm font-medium capitalize">{report.trend}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 h-12 items-end">
            {report.trend_data.map((score, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-sm"
                style={{ height: `${(score / 10) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-400" />
            <div className="text-sm text-gray-400">Best Time to Visit</div>
          </div>
          <div className="text-2xl font-bold text-white mb-4">{report.best_time}</div>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-1">Peak Hours:</div>
            <div className="flex flex-wrap gap-2">
              {report.peak_hours.map((hour, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium"
                >
                  {hour}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-3">
              Avg Wait: <span className="text-white font-medium">{report.avg_wait_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value & Competition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div className="text-sm text-gray-400">Value Rating</div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">{report.value_rating}</div>
          <div className="text-sm text-gray-400">
            Price Range: <span className="text-white font-medium">{report.price_range}</span>
          </div>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <div className="text-sm text-gray-400">Competition</div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-white">#{report.competitor_comparison.rank}</span>
            <span className="text-sm text-gray-400">/ {report.competitor_comparison.total}</span>
          </div>
          <div className="text-sm text-gray-400">in {report.competitor_comparison.area}</div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            Strengths
          </div>
          <ul className="space-y-2">
            {report.strengths.map((strength, i) => (
              <li key={i} className="text-sm text-white flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            Weaknesses
          </div>
          <ul className="space-y-2">
            {report.weaknesses.map((weakness, i) => (
              <li key={i} className="text-sm text-white flex items-start gap-2">
                <span className="text-red-400 mt-0.5">⚠</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <div className="text-sm font-medium text-orange-400">Recommendation</div>
        </div>
        <p className="text-white">{report.recommendation}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {report.cuisine_tags.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
