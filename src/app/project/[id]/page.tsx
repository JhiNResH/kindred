'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AISummaryCard } from '@/components/project/AISummaryCard'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { CommunityInfo } from '@/components/project/CommunityInfo'

import { useStore, Project } from '@/lib/store'

import { useState, useEffect } from 'react'
import { analyzeProject } from '@/app/actions/analyze'
import { Sparkles, Users } from 'lucide-react'

// Initial loading state mock
const LOADING_PROJECT: any = { 
  id: 'loading',
  name: 'Analyzing...',
  category: 'k/research',
  aiVerdict: 'neutral',
  aiScore: 0,
  aiSummary: 'Calling Ma\'at for deep verification... (Checking On-Chain Data)',
  keyPoints: ['Verifying Contract Safety...', 'Scanning Social Signals...', 'Auditing Team Background...']
}

export default function ProjectPage() {
  const params = useParams()
  const idRaw = Array.isArray(params.id) ? params.id[0] : params.id
  const projectId = idRaw.toLowerCase()

  // Store Hooks
  const storedProject = useStore(state => state.getProject(projectId))
  const addProject = useStore(state => state.addProject)
  const joinCommunity = useStore(state => state.joinCommunity)
  const leaveCommunity = useStore(state => state.leaveCommunity)
  const communities = useStore(state => state.communities)
  const isJoined = useStore(state => state.joinedCommunityIds.includes(projectId))

  const [projectData, setProjectData] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  
  // Fetch reviews for this project
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?target=${projectId}`)
        const data = await res.json()
        setReviews(data.reviews || [])
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [projectId])
  
  useEffect(() => {
    if (storedProject) {
      // Use verified data from store if available
      setProjectData({
         ...storedProject,
         // Map store data back to UI format expected by this page's legacy types
         aiVerdict: storedProject.score >= 4 ? 'bullish' : storedProject.score <= 2.5 ? 'bearish' : 'neutral',
         aiScore: storedProject.score * 20,
         keyPoints: [], // storedProject in store.ts might need expanding to hold these if we want to persist details
         // For now, re-fetching deep details or assuming lightweight store
      })
      // If store data is lightweight, we might still want to trigger deep analysis if missing details?
      // For now, trust store.
    } else {
      // Trigger "Ma'at" Analysis
      setProjectData(LOADING_PROJECT)
      analyzeProject(projectId).then((result) => {
        const fullData = {
          ...LOADING_PROJECT,
          id: projectId,
          name: result.name,
          ticker: result.tokenSymbol || result.name.substring(0, 4).toUpperCase(),
          category: `k/${result.type.toLowerCase()}`,
          price: result.tokenPrice || '-',
          marketCap: result.tvl || '-',
          volume24h: '-',
          
          aiVerdict: result.status === 'VERIFIED' ? 'bullish' : result.status === 'RISKY' ? 'bearish' : 'neutral',
          aiScore: result.score * 20,
          aiSummary: result.summary,
          keyPoints: result.features,
          
          riskWarnings: result.warnings,
          audits: result.audits,
          investors: result.investors,
          maAtStatus: result.status,
        }
        
        setProjectData(fullData)

        // AUTO ADD: Persist verified project to store
        // We map the analysis result to our simple Store Project type
        addProject({
          id: projectId,
          name: result.name,
          ticker: result.tokenSymbol || "UNK",
          category: result.type,
          score: result.score,
          tvl: result.tvl,
          reviewsCount: 0,
          logo: undefined
        })
      })
    }
  }, [projectId, storedProject, addProject])

  const data = projectData || LOADING_PROJECT

  const handleJoin = () => {
    if (isJoined) {
      leaveCommunity(projectId)
    } else {
      joinCommunity(projectId)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Project Banner */}
      <div className="h-48 bg-gradient-to-r from-gray-900 to-black border-b border-[#1f1f23] relative">
        <div className="absolute bottom-0 left-0 w-full h-full bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#111113] border-4 border-[#0a0a0b] rounded-2xl flex items-center justify-center text-4xl shadow-2xl relative overflow-hidden">
               {/* Ma'at Glow Effect */}
               {data.id === 'loading' && (
                 <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />
               )}
               {data.name[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  {data.name}
                  {data === projectData && !storedProject && data.id !== 'loading' && (
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium flex items-center gap-1 ${
                      data.maAtStatus === 'VERIFIED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      data.maAtStatus === 'RISKY' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    }`}>
                      <Sparkles className="w-3 h-3" />
                      Ma'at Verified: {data.maAtStatus}
                    </span>
                  )}
                </h1>
                <span className="px-3 py-1 bg-[#2a2a2e] text-gray-400 rounded-full text-xs font-medium border border-[#3f3f46]">
                  {data.category}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{data.category.startsWith('k/') ? `r/${data.category.split('/')[1]}` : data.category}</span>
                <span>•</span>
                <span>Tier 1 Project</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex gap-3">
             <Link 
              href="/review" 
              className="bg-kindred-primary text-white hover:bg-orange-600 px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span>Write Review</span>
            </Link>
            <button 
              onClick={handleJoin}
              className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 border ${
                isJoined 
                  ? 'bg-transparent border-[#2a2a2e] text-white hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400' 
                  : 'bg-[#1a1a1d] border-[#2a2a2e] text-white hover:bg-[#2a2a2e]'
              }`}
            >
              {isJoined ? 'Joined' : 'Join Community'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          
          {/* AI Analysis Section */}
          <AISummaryCard 
            projectName={data.name}
            verdict={data.aiVerdict}
            score={data.aiScore}
            summary={data.aiSummary}
            keyPoints={data.keyPoints}
          />

          {/* New Ma'at Auditor Section */}
          {(data.riskWarnings?.length > 0 || data.audits?.length > 0) && (
            <div className="mb-6 p-4 rounded-xl bg-[#1a1a1d] border border-yellow-500/20">
              <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                ⚠️ Ma'at Risk Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                 {data.riskWarnings?.length > 0 && (
                   <div>
                     <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Warnings</h4>
                     <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                       {data.riskWarnings.map((w: string, i: number) => (
                         <li key={i}>{w}</li>
                       ))}
                     </ul>
                   </div>
                 )}
                 {data.audits?.length > 0 && (
                   <div>
                     <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Security Audits</h4>
                     <ul className="space-y-2">
                       {data.audits.map((a: any, i: number) => (
                         <li key={i} className="flex items-center justify-between text-sm bg-black/20 p-2 rounded">
                           <span className="text-green-400 font-medium">{a.auditor}</span>
                           <span className="text-gray-500 text-xs">{a.date || 'Verified'}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* Discussion / Reviews */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Community Discussion</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg text-sm text-white">Top</button>
              <button className="px-3 py-1 text-gray-500 hover:text-white text-sm">New</button>
            </div>
          </div>

          <div className="space-y-4">
            {loadingReviews ? (
              <div className="text-center py-8 text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No reviews yet. Be the first!</div>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block">
           <CommunityInfo category={data.category} />
           
           {/* Project Stats Widget */}
           <div className="w-80 mt-6 bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
              <h3 className="font-semibold mb-4 text-sm text-gray-400 uppercase">Market Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Price</span>
                  <span className="font-mono">{data.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">24h Vol</span>
                  <span className="font-mono">{data.volume24h}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Market Cap</span>
                  <span className="font-mono">{data.marketCap}</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  )
}
