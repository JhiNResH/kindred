'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Circle, Wallet, Search, Star, TrendingUp, Award } from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  link: string
  action: string
}

const DEMO_STEPS: Step[] = [
  {
    id: 1,
    title: 'Connect Wallet',
    description: 'Link your Web3 wallet to get started',
    icon: <Wallet className="w-6 h-6" />,
    link: '#',
    action: 'Connect'
  },
  {
    id: 2,
    title: 'Browse Markets',
    description: 'Explore DeFi projects and predictions',
    icon: <Search className="w-6 h-6" />,
    link: '/leaderboard',
    action: 'Explore'
  },
  {
    id: 3,
    title: 'Write Review',
    description: 'Share your analysis and predict rankings',
    icon: <Star className="w-6 h-6" />,
    link: '/review',
    action: 'Review'
  },
  {
    id: 4,
    title: 'Stake Prediction',
    description: 'Back your prediction with tokens',
    icon: <TrendingUp className="w-6 h-6" />,
    link: '/stake',
    action: 'Stake'
  },
  {
    id: 5,
    title: 'Earn Rewards',
    description: 'Correct predictions earn from the pool',
    icon: <Award className="w-6 h-6" />,
    link: '/leaderboard',
    action: 'View'
  }
]

export function DemoFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId)
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#111113] to-[#0a0a0b] border border-[#1f1f23] rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">How Maat Works</h2>
        <p className="text-[#6b6b70]">Your journey from discovery to rewards</p>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#1f1f23] -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-700 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${(completedSteps.length / DEMO_STEPS.length) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {DEMO_STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex flex-col items-center transition-all ${
                currentStep === step.id ? 'scale-110' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                completedSteps.includes(step.id)
                  ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                  : currentStep === step.id
                  ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500'
                  : 'bg-[#1f1f23] text-[#6b6b70]'
              }`}>
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  step.icon
                )}
              </div>
              <span className={`text-xs font-medium ${
                currentStep === step.id ? 'text-purple-400' : 'text-[#6b6b70]'
              }`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Detail */}
      <div className="bg-[#0a0a0b] border border-[#1f1f23] rounded-xl p-6 mb-6">
        {DEMO_STEPS.filter(s => s.id === (currentStep || 1)).map((step) => (
          <div key={step.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center text-purple-400">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                <p className="text-[#6b6b70]">{step.description}</p>
              </div>
            </div>
            <Link
              href={step.link}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg text-white font-medium hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              {step.action}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
          <div className="text-2xl font-bold text-purple-400">$2.4M</div>
          <div className="text-xs text-[#6b6b70]">Total Staked</div>
        </div>
        <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
          <div className="text-2xl font-bold text-green-400">12,847</div>
          <div className="text-xs text-[#6b6b70]">Reviews</div>
        </div>
        <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">68%</div>
          <div className="text-xs text-[#6b6b70]">Accuracy</div>
        </div>
        <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
          <div className="text-2xl font-bold text-blue-400">4</div>
          <div className="text-xs text-[#6b6b70]">Markets</div>
        </div>
      </div>
    </div>
  )
}
