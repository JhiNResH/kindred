'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, FileText, User, Folder, Sparkles, Plus } from 'lucide-react'
import { findOrCreateProject } from '@/app/actions/createProject'
import { useStore } from '@/lib/store'

interface SearchResult {
  projects: Array<{
    id: string
    address: string
    name: string
    category: string
    avgRating: number
    reviewCount: number
  }>
  reviews: Array<{
    id: string
    content: string
    contentPreview: string
    rating: number
    reviewer: { address: string; displayName: string | null }
    project: { name: string; category: string }
  }>
  users: Array<{
    id: string
    address: string
    displayName: string | null
    reputationScore: number
  }>
  aiAnalysis?: {
    source: string
    cached: boolean
    data: {
      name: string
      type: string
      score: number
      status: string
      summary: string
    }
  }
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'reviews' | 'users'>('all')
  
  // Store actions for sidebar sync
  const addProject = useStore(state => state.addProject)
  const joinCommunity = useStore(state => state.joinCommunity)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults(null)
    }
  }, [isOpen])

  // Keyboard shortcut to open modal (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          // Parent should handle opening
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Debounced search
  const search = useCallback(async (q: string, analyze = false) => {
    if (q.length < 2) {
      setResults(null)
      return
    }

    setIsLoading(true)
    if (analyze) setIsAnalyzing(true)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&analyze=${analyze}`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        search(query)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  // Handle AI analysis - this creates the project if it doesn't exist
  const handleAnalyze = async () => {
    if (query.length < 2) return
    
    setIsAnalyzing(true)
    try {
      // Call server action to find or create project with Gemini analysis
      const result = await findOrCreateProject(query)
      
      if (result.success && result.project) {
        // Add to store for sidebar display
        addProject({
          id: result.project.id,
          name: result.project.name,
          ticker: result.project.name.toUpperCase().slice(0, 4),
          category: result.project.category,
          score: 0,
          reviewsCount: 0,
        })
        
        // Auto-join the community when searching
        joinCommunity(result.project.id)
        
        // Navigate to the newly created/found project page
        const targetUrl = `/${result.project.category}/${result.project.id}`
        console.log('[SearchModal] Navigating to:', targetUrl, 'Category:', result.project.category)
        router.push(targetUrl)
        onClose()
      } else {
        // Fall back to basic search with analyze flag
        search(query, true)
      }
    } catch (err) {
      console.error('Analysis failed:', err)
      search(query, true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate slug from name (for gourmet routes)
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Handle result click (use address for URL, not database ID)
  const handleProjectClick = (address: string, category: string, name?: string) => {
    // Ensure category starts with 'k/' or map it from Type
    let cleanCategory = category.toLowerCase()
    
    // Simple mapping if we get raw types like "DEX" instead of "k/perp-dex"
    // Ideally this should match backend logic
    if (!cleanCategory.startsWith('k/')) {
       const map: Record<string, string> = {
         'dex': 'k/perp-dex',
         'defi': 'k/defi', 
         'nft': 'k/nft',
         'ai': 'k/ai',
         'meme': 'k/memecoin',
         'infrastructure': 'k/infra',
         'gourmet': 'k/gourmet'
       }
       cleanCategory = map[cleanCategory] || 'k/defi'
    }

    // For gourmet, use slug-based route instead of address
    if (cleanCategory === 'k/gourmet' && name) {
      router.push(`/k/gourmet/${generateSlug(name)}`)
    } else {
      router.push(`/${cleanCategory}/${address}`)
    }
    onClose()
  }

  const handleReviewClick = (reviewId: string) => {
    router.push(`/reviews/${reviewId}`)
    onClose()
  }

  const handleUserClick = (address: string) => {
    router.push(`/user/${address}`)
    onClose()
  }

  if (!isOpen) return null

  const totalResults = results 
    ? results.projects.length + results.reviews.length + results.users.length
    : 0

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2e]">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-[#6b6b70]" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, Twitter URLs, websites, or addresses..."
              className="flex-1 bg-transparent text-white placeholder:text-[#6b6b70] outline-none text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-[#6b6b70] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-[#2a2a2e] bg-[#1a1a1d] px-2 text-xs text-[#6b6b70]">
              ESC
            </kbd>
          </div>

          {/* Search Hint */}
          {query.length === 0 && (
            <div className="px-4 py-3 border-b border-[#1f1f23]">
              <p className="text-xs text-[#6b6b70]">
                💡 <span className="text-[#adadb0]">Try:</span> Project names, Twitter handles (@Uniswap), 
                URLs (uniswap.org), or contract addresses (0x...)
              </p>
            </div>
          )}

          {/* Results */}
          {query.length >= 2 && (
            <div className="max-h-[400px] overflow-y-auto">
              {/* Tabs */}
              <div className="flex gap-2 px-4 py-2 border-b border-[#1f1f23]">
                {(['all', 'projects', 'reviews', 'users'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      activeTab === tab
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-[#6b6b70] hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* AI Analysis Button */}
              {(!results?.aiAnalysis && (!results?.projects.length || results.projects.length === 0) && !isAnalyzing) && (
                <button
                  onClick={handleAnalyze}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a1d] border-b border-[#1f1f23] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Analyze "{query}" with Ma'at AI</p>
                    <p className="text-sm text-[#6b6b70]">Get real-time project analysis and verification</p>
                  </div>
                </button>
              )}

              {/* AI Analysis Loading */}
              {isAnalyzing && (
                <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1f1f23]">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                  <span className="text-[#adadb0]">Ma'at is analyzing "{query}"...</span>
                </div>
              )}

              {/* AI Analysis Result */}
              {results?.aiAnalysis && (
                <button
                  onClick={handleAnalyze} // Create project and navigate
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a1d] border-b border-[#1f1f23] transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    results.aiAnalysis.data.status === 'VERIFIED' ? 'bg-green-500/20' :
                    results.aiAnalysis.data.status === 'RISKY' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <Sparkles className={`w-5 h-5 ${
                      results.aiAnalysis.data.status === 'VERIFIED' ? 'text-green-400' :
                      results.aiAnalysis.data.status === 'RISKY' ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{results.aiAnalysis.data.name}</p>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        results.aiAnalysis.data.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' :
                        results.aiAnalysis.data.status === 'RISKY' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {results.aiAnalysis.data.status}
                      </span>
                      {results.aiAnalysis.cached && (
                        <span className="text-xs text-[#6b6b70]">cached</span>
                      )}
                    </div>
                    <p className="text-sm text-[#6b6b70] line-clamp-2">{results.aiAnalysis.data.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{results.aiAnalysis.data.score.toFixed(1)}</p>
                    <p className="text-xs text-[#6b6b70]">Ma'at Score</p>
                  </div>
                </button>
              )}

              {/* Projects - Grouped by Category */}
              {(activeTab === 'all' || activeTab === 'projects') && (() => {
                if (!results?.projects.length) return null
                
                // Group projects by category
                const grouped = results.projects.reduce((acc, project) => {
                  const cat = project.category
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(project)
                  return acc
                }, {} as Record<string, typeof results.projects>)
                
                // Category metadata
                const categoryMeta: Record<string, { icon: string; label: string; color: string }> = {
                  'k/defi': { icon: '🏦', label: 'DeFi', color: 'blue' },
                  'k/perp-dex': { icon: '📈', label: 'Perp DEX', color: 'purple' },
                  'k/prediction': { icon: '📊', label: 'Prediction', color: 'green' },
                  'k/memecoin': { icon: '🐕', label: 'Memecoin', color: 'yellow' },
                  'k/ai': { icon: '🤖', label: 'AI', color: 'pink' },
                  'k/infra': { icon: '🏗️', label: 'Infrastructure', color: 'gray' },
                  'k/gourmet': { icon: '🍽️', label: 'Restaurant', color: 'orange' },
                  'k/nft': { icon: '🎨', label: 'NFT', color: 'indigo' },
                }
                
                return Object.entries(grouped).map(([category, projects]) => {
                  const meta = categoryMeta[category] || { icon: '📁', label: category, color: 'gray' }
                  
                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="px-4 py-2 bg-[#0d0d0e] border-b border-[#1f1f23]">
                        <p className="text-xs font-medium text-[#adadb0] flex items-center gap-2">
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                          <span className="text-[#6b6b70]">({projects.length})</span>
                        </p>
                      </div>
                      
                      {/* Projects in this category */}
                      {projects.map(project => {
                        // Static color classes (Tailwind doesn't support dynamic interpolation)
                        const colorClasses: Record<string, { bg: string; badge: string; text: string }> = {
                          'blue': { bg: 'bg-blue-500/10', badge: 'bg-blue-500/20', text: 'text-blue-400' },
                          'purple': { bg: 'bg-purple-500/10', badge: 'bg-purple-500/20', text: 'text-purple-400' },
                          'green': { bg: 'bg-green-500/10', badge: 'bg-green-500/20', text: 'text-green-400' },
                          'yellow': { bg: 'bg-yellow-500/10', badge: 'bg-yellow-500/20', text: 'text-yellow-400' },
                          'pink': { bg: 'bg-pink-500/10', badge: 'bg-pink-500/20', text: 'text-pink-400' },
                          'gray': { bg: 'bg-gray-500/10', badge: 'bg-gray-500/20', text: 'text-gray-400' },
                          'orange': { bg: 'bg-orange-500/10', badge: 'bg-orange-500/20', text: 'text-orange-400' },
                          'indigo': { bg: 'bg-indigo-500/10', badge: 'bg-indigo-500/20', text: 'text-indigo-400' },
                        }
                        const colors = colorClasses[meta.color] || colorClasses['gray']
                        
                        return (
                          <button
                            key={project.id}
                            onClick={() => handleProjectClick(project.address, project.category, project.name)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a1d] border-b border-[#1f1f23] transition-colors"
                          >
                            <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                              <span className="text-xl">{meta.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">{project.name}</p>
                                <span className={`px-2 py-0.5 text-xs rounded ${colors.badge} ${colors.text}`}>
                                  {meta.label}
                                </span>
                              </div>
                              <p className="text-sm text-[#6b6b70]">{project.reviewCount} reviews</p>
                            </div>
                            <div className="text-sm text-[#adadb0]">
                              ⭐ {project.avgRating.toFixed(1)}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              })()}

              {/* Reviews */}
              {(activeTab === 'all' || activeTab === 'reviews') && results?.reviews.map(review => (
                <button
                  key={review.id}
                  onClick={() => handleReviewClick(review.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a1d] border-b border-[#1f1f23] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1d] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{review.contentPreview}</p>
                    <p className="text-xs text-[#6b6b70] mt-1">
                      on {review.project.name} · by {review.reviewer.displayName || review.reviewer.address.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-sm text-[#adadb0]">
                    ⭐ {review.rating}
                  </div>
                </button>
              ))}

              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && results?.users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.address)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a1d] border-b border-[#1f1f23] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1d] flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.displayName || user.address.slice(0, 10)}</p>
                    <p className="text-sm text-[#6b6b70]">{user.address.slice(0, 10)}... · Rep: {user.reputationScore}</p>
                  </div>
                </button>
              ))}

              {/* No Results */}
              {totalResults === 0 && !isLoading && !results?.aiAnalysis && !isAnalyzing && (
                <div className="px-4 py-8 text-center text-[#6b6b70]">
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try Ma'at AI analysis above</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#1f1f23] flex items-center gap-4 text-xs text-[#6b6b70]">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </>
  )
}
