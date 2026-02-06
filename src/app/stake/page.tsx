'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WalletButton } from '@/components/WalletButton'
import { StakeCard } from '@/components/StakeCard'

type Category = 'k/defi' | 'k/perp-dex' | 'k/memecoin' | 'k/ai'

interface Project {
  name: string
  address: string
  category: Category
  currentRank: number
  icon: string
  poolSize: string
}

const CATEGORIES: { value: Category | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Markets', icon: '📋' },
  { value: 'k/defi', label: 'DeFi', icon: '🏦' },
  { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈' },
  { value: 'k/memecoin', label: 'Memecoins', icon: '🐸' },
  { value: 'k/ai', label: 'AI Agents', icon: '🤖' },
]

export default function StakePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const categoryParam = selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''
        const res = await fetch(`/api/projects${categoryParam}`)
        const data = await res.json()
        setProjects(data.projects || [])
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [selectedCategory])

  const filteredProjects = projects

  const handleStake = async (amount: string, predictedRank: number) => {
    // TODO: Implement actual staking logic with smart contract
    console.log('Staking:', { amount, predictedRank, project: selectedProject })
    alert(`Staked ${amount} OPEN predicting #${predictedRank} for ${selectedProject?.name}`)
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
          <Link href="/leaderboard" className="text-gray-400 hover:text-white transition">
            Rankings
          </Link>
          <Link href="/reviews" className="text-gray-400 hover:text-white transition">
            Reviews
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">💰 Stake Predictions</h1>
          <p className="text-gray-400 text-lg">
            Put your OPEN where your opinions are. Predict rankings, stake, and earn.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8 p-4 bg-gray-900/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">-</div>
            <div className="text-xs text-gray-500">Total Staked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">-</div>
            <div className="text-xs text-gray-500">Active Predictions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{projects.length}</div>
            <div className="text-xs text-gray-500">Markets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-kindred-primary">-</div>
            <div className="text-xs text-gray-500">Until Settlement</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Selection */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedCategory === cat.value
                      ? 'bg-kindred-primary text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Project Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 text-center py-8 text-gray-500">Loading projects...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">No projects found</div>
              ) : filteredProjects.map((project) => (
                <button
                  key={project.address}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 rounded-xl border text-left transition ${
                    selectedProject?.address === project.address
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-800 hover:border-gray-600 bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{project.icon}</span>
                    <div>
                      <h3 className="font-bold">{project.name}</h3>
                      <p className="text-xs text-gray-500">{project.category}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-lg font-bold">#{project.currentRank}</div>
                      <div className="text-xs text-gray-500">Current</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pool:</span>
                    <span className="text-green-400 font-mono">
                      {(Number(project.poolSize) / 1e18 / 1000).toFixed(0)}k OPEN
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stake Card */}
          <div className="lg:col-span-1">
            {selectedProject ? (
              <div className="sticky top-6">
                <StakeCard
                  project={selectedProject}
                  totalPoolSize={selectedProject.poolSize}
                  onStake={handleStake}
                />
              </div>
            ) : (
              <div className="bg-kindred-dark border border-gray-800 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-bold mb-2">Select a Project</h3>
                <p className="text-gray-400">
                  Choose a project from the left to stake your prediction
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How Staking Works */}
        <div className="mt-12 p-6 bg-gray-900/50 rounded-xl">
          <h2 className="text-xl font-bold mb-4">How Staking Works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-semibold mb-1">Pick a Project</h3>
              <p className="text-sm text-gray-400">Choose from DeFi, Perp DEX, Memecoins, or AI Agents</p>
            </div>
            <div>
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-semibold mb-1">Predict Rank</h3>
              <p className="text-sm text-gray-400">Where will it rank by week's end? Higher risk = higher reward</p>
            </div>
            <div>
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-semibold mb-1">Stake OPEN</h3>
              <p className="text-sm text-gray-400">Back your prediction with tokens. Locked until settlement</p>
            </div>
            <div>
              <div className="text-2xl mb-2">4️⃣</div>
              <h3 className="font-semibold mb-1">Earn Rewards</h3>
              <p className="text-sm text-gray-400">Correct predictions earn from the pool. Wrong = lose stake</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 mt-12">
        <p>Built with 🦞 by Team Kindred for Openwork Hackathon 2025</p>
      </footer>
    </main>
  )
}
