'use client'

import { Zap, Clock, Shield } from 'lucide-react'

interface PriorityBadgeProps {
  reputation: number
  isAgent?: boolean
}

export function PriorityBadge({ reputation, isAgent = false }: PriorityBadgeProps) {
  const getPriorityLevel = (score: number): {
    level: number
    label: string
    color: string
    icon: React.ReactNode
    description: string
  } => {
    if (score >= 850) {
      return {
        level: 3,
        label: 'Immediate',
        color: 'from-green-500 to-emerald-500',
        icon: <Zap className="w-4 h-4" />,
        description: 'Your trades execute instantly with maximum MEV protection',
      }
    } else if (score >= 600) {
      return {
        level: 2,
        label: 'Normal',
        color: 'from-blue-500 to-cyan-500',
        icon: <Shield className="w-4 h-4" />,
        description: 'Standard execution speed with MEV protection',
      }
    } else {
      return {
        level: 1,
        label: 'Protected',
        color: 'from-orange-500 to-yellow-500',
        icon: <Clock className="w-4 h-4" />,
        description: 'Delayed execution provides extra MEV protection',
      }
    }
  }

  const priority = getPriorityLevel(reputation)

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${priority.color} flex items-center justify-center`}>
            {priority.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                Priority: {priority.label}
              </span>
              {isAgent && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded">
                  AI Agent
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{priority.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{priority.level}</div>
          <div className="text-xs text-slate-400">Level</div>
        </div>
      </div>

      {/* Priority Explanation */}
      <div className="mt-3 p-3 bg-black/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            {priority.level === 3 && (
              <span>
                <strong>Instant execution:</strong> Your high reputation grants immediate transaction
                processing with zero MEV delay. Maximum protection from sandwich attacks.
              </span>
            )}
            {priority.level === 2 && (
              <span>
                <strong>Normal priority:</strong> Transactions execute in the next block with
                standard MEV protection.
              </span>
            )}
            {priority.level === 1 && (
              <span>
                <strong>MEV Protection Mode:</strong> Your trade is delayed by 1-2 blocks to prevent
                sandwich attacks. Build reputation to increase priority.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reputation Progress */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Reputation Score</span>
          <span>{reputation}/1000</span>
        </div>
        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${priority.color} transition-all duration-500`}
            style={{ width: `${(reputation / 1000) * 100}%` }}
          />
        </div>
        {reputation < 850 && (
          <p className="text-xs text-slate-500 mt-1">
            {reputation < 600 
              ? `${600 - reputation} points to Normal priority`
              : `${850 - reputation} points to Immediate priority`}
          </p>
        )}
      </div>
    </div>
  )
}
