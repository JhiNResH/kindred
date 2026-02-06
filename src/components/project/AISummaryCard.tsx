'use client'

import { Bot, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface AISummaryCardProps {
  projectName: string
  verdict: 'bullish' | 'bearish' | 'neutral'
  score: number
  summary: string
  keyPoints: string[]
  reviewCount?: number
  totalStaked?: string
}

export function AISummaryCard({ projectName, verdict, score, summary, keyPoints, reviewCount = 0, totalStaked = '0' }: AISummaryCardProps) {
  // Calculate sentiment from score (score is 0-100)
  const sentiment = Math.round(score * 0.9 + 5) // Maps 0-100 to roughly 5-95%
  const isBullish = verdict === 'bullish'
  const isBearish = verdict === 'bearish'

  return (
    <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden mb-8">
      {/* Header with AI Agent Branding */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white">AnalyzerAI Verdict</h2>
            <div className="text-xs text-purple-300">
              {reviewCount > 0 ? `Analysis based on ${reviewCount} verified reviews` : 'AI-powered analysis'}
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          isBullish ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          isBearish ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          'bg-gray-500/10 border-gray-500/30 text-gray-400'
        }`}>
          {isBullish ? <TrendingUp className="w-4 h-4" /> : 
           isBearish ? <TrendingDown className="w-4 h-4" /> : 
           <AlertTriangle className="w-4 h-4" />}
          <span className="font-bold uppercase tracking-wider text-xs">{verdict}</span>
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-3 gap-8">
        {/* Left: Summary Text */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-3 text-white">Executive Summary</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            {summary}
          </p>
          
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Consensus</h4>
          <ul className="space-y-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="text-purple-500 mt-1">●</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Score Card */}
        <div className="border-l border-[#1f1f23] pl-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-1">Community Trust Score</div>
            <div className="text-5xl font-bold text-white tracking-tight">{score}</div>
            <div className={`text-sm mt-2 font-medium ${
              score >= 80 ? 'text-green-400' : 
              score >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {score >= 80 ? 'Very High Trust' : score >= 50 ? 'Moderate Trust' : 'Low Trust'}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sentiment</span>
              <span className={sentiment >= 50 ? 'text-green-400' : 'text-red-400'}>
                {sentiment}% {sentiment >= 50 ? 'Positive' : 'Negative'}
              </span>
            </div>
            <div className="w-full bg-[#1a1a1d] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${sentiment >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${sentiment}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Volume</span>
              <span className="text-white">
                {totalStaked !== '0' ? `$${(parseInt(totalStaked) / 1e18).toFixed(1)}M Staked` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-[#1a1a1d]/50 border-t border-[#1f1f23] text-xs text-gray-500 text-center">
        AI analysis updated 15 mins ago • Powered by Kindred AI
      </div>
    </div>
  )
}
