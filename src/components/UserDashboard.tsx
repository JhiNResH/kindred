'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Trophy, Star, Coins, FileText, TrendingUp, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui'

export function UserDashboard() {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState({
    trustScore: 0,
    totalReviews: 0,
    kindEarned: '0',
    kindStaked: '0',
    rank: 0,
    upvotes: 0,
  })
  const [activities, setActivities] = useState<{ type: 'review' | 'upvote' | 'badge'; text: string; time: string; reward?: string }[]>([])

  useEffect(() => {
    async function fetchDashboard() {
      if (!address) return
      try {
        const res = await fetch(`/api/user/dashboard?address=${address}`)
        const data = await res.json()
        if (data.stats) setStats(data.stats)
        if (data.activities) setActivities(data.activities)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      }
    }
    if (isConnected && address) {
      fetchDashboard()
    }
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <Card className="text-center py-12">
        <div className="text-[#6b6b70] mb-4">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Connect your wallet to see your dashboard</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trust Score Hero */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#adadb0] mb-1">Your Trust Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-purple-400">{stats.trustScore}</span>
              <span className="text-[#6b6b70]">/ 100</span>
            </div>
            {stats.trustScore > 0 && (
              <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
              </p>
            )}
          </div>
          <div className="text-right">
            <Award className="w-16 h-16 text-purple-400 opacity-50" />
            <p className="text-sm text-[#6b6b70] mt-2">Rank #{stats.rank}</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Reviews"
          value={stats.totalReviews.toString()}
        />
        <StatCard
          icon={Star}
          label="Upvotes"
          value={stats.upvotes.toLocaleString()}
        />
        <StatCard
          icon={Coins}
          label="$KIND Earned"
          value={stats.kindEarned}
        />
        <StatCard 
          icon={Coins} 
          label="$KIND Staked" 
          value={stats.kindStaked} 
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-[#6b6b70] text-center py-2">No recent activity</p>
            ) : activities.map((activity, i) => (
              <ActivityItem key={i} {...activity} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change,
  color = 'default'
}: { 
  icon: any
  label: string
  value: string
  change?: string
  color?: 'default' | 'purple'
}) {
  return (
    <Card padding="sm" className={color === 'purple' ? 'border-purple-500/30' : ''}>
      <div className="flex items-start justify-between mb-2">
        <Icon className={`w-5 h-5 ${color === 'purple' ? 'text-purple-400' : 'text-[#6b6b70]'}`} />
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-xs text-[#6b6b70]">{label}</div>
      {change && <div className="text-xs text-green-500 mt-1">{change}</div>}
    </Card>
  )
}

function ActivityItem({ 
  type, 
  text, 
  time, 
  reward 
}: { 
  type: 'review' | 'upvote' | 'badge'
  text: string
  time: string
  reward?: string
}) {
  const icons = {
    review: FileText,
    upvote: Star,
    badge: Award,
  }
  const Icon = icons[type]

  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#1f1f23] last:border-0">
      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-[#6b6b70]">{time}</p>
      </div>
      {reward && (
        <span className="text-xs text-green-500 font-medium">{reward}</span>
      )}
    </div>
  )
}
