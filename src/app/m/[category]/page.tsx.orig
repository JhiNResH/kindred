'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Plus, Search, TrendingUp } from 'lucide-react'

interface Project {
  id: string
  address: string
  name: string
  image: string | null
  category: string
  avgRating: number
  reviewCount: number
  bullishCount: number
  bearishCount: number
  mindshareScore: number
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch projects for this category
  useEffect(() => {
    async function fetchProjects() {
      try {
        // Ensure category has k/ prefix
        const fullCategory = category.startsWith('k/') ? category : `k/${category}`
        const res = await fetch(`/api/leaderboard?category=${fullCategory}&limit=50`)
        const data = await res.json()
        setProjects(data.leaderboard || [])
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (category) {
      fetchProjects()
    }
  }, [category])

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categoryLabel = category.replace('k/', '').toUpperCase()

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <div className="border-b border-[#1f1f23] sticky top-[65px] z-40 bg-[#0a0a0b]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold capitalize">
                {category.replace('k/', '')} Projects
              </h1>
              <p className="text-[#adadb0] text-sm mt-1">
                {projects.length} projects in {categoryLabel}
              </p>
            </div>
            <button
              onClick={() => router.push(`/${category}?mode=create`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#6b6b70]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1f1f23] border border-[#2a2a2e] rounded-lg text-white placeholder-[#6b6b70] focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-[#adadb0]">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#adadb0] mb-4">No projects found</p>
            <button
              onClick={() => router.push(`/${category}?mode=create`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/${project.category}/${project.id}`}
                className="group"
              >
                <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-lg p-4 hover:border-purple-500/50 hover:bg-[#2a2a2e] transition cursor-pointer">
                  {/* Logo + Name */}
                  <div className="flex items-start gap-3 mb-4">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.projectName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '🏛️'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">
                        🏛️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate group-hover:text-purple-400 transition">
                        {project.projectName}
                      </h3>
                      <p className="text-xs text-[#6b6b70] capitalize">
                        {project.category.replace('k/', '')}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#adadb0]">Rating</span>
                      <span className="font-semibold text-purple-400">
                        {project.avgRating.toFixed(1)} / 5
                      </span>
                    </div>

                    {/* Reviews */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#adadb0]">Reviews</span>
                      <span className="font-semibold">{project.reviewCount}</span>
                    </div>

                    {/* Sentiment */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#adadb0]">Sentiment</span>
                      <div className="flex gap-2">
                        <span className="text-green-400">👍 {project.bullishCount}</span>
                        <span className="text-red-400">👎 {project.bearishCount}</span>
                      </div>
                    </div>

                    {/* Mindshare */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#adadb0] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Mindshare
                      </span>
                      <span className="font-semibold text-purple-400">
                        {project.mindshareScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
