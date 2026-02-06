'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AISummaryCard } from '@/components/project/AISummaryCard'
import { CommunityInfo } from '@/components/project/CommunityInfo'
import { StakeVote } from '@/components/StakeVote'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { analyzeProject } from '@/app/actions/analyze'
import { findOrCreateProject } from '@/app/actions/createProject'
import { getTokenPrice, TokenPrice } from '@/lib/coingecko'
import { Sparkles } from 'lucide-react'

interface ProjectPageContentProps {
  projectId: string
  category: string
  initialProject: any
  initialReviews: any[]
}

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

export function ProjectPageContent({
  projectId,
  category,
  initialProject,
  initialReviews,
}: ProjectPageContentProps) {
  // Store Hooks
  const addProject = useStore(state => state.addProject)
  const joinCommunity = useStore(state => state.joinCommunity)
  const leaveCommunity = useStore(state => state.leaveCommunity)
  const isJoined = useStore(state => state.joinedCommunityIds.includes(projectId))

  const [projectData, setProjectData] = useState<any>(initialProject || null)
  const [reviews, setReviews] = useState<any[]>(initialReviews || [])
  const [loadingReviews, setLoadingReviews] = useState(!initialReviews?.length)
  const [tokenPrice, setTokenPrice] = useState<TokenPrice | null>(null)
  
  // Fetch real-time price from CoinGecko
  useEffect(() => {
    async function fetchPrice() {
      if (projectData?.name && projectData.name !== 'Analyzing...') {
        const price = await getTokenPrice(projectData.name)
        if (price) {
          setTokenPrice(price)
        }
      }
    }
    fetchPrice()
  }, [projectData?.name])
  
  // Fetch reviews if not provided initially
  useEffect(() => {
    if (initialReviews?.length) return
    
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
  }, [projectId, initialReviews])
  
  useEffect(() => {
    // Skip if we already have full project data from server
    if (initialProject?.aiSummary) {
      setProjectData(initialProject)
      return
    }
    
    // Fetch Ma'at analysis if we don't have it
    setProjectData(LOADING_PROJECT)
    
    findOrCreateProject(projectId).then((createResult) => {
      if (!createResult.success || !createResult.analysis) {
        analyzeProject(projectId).then((result) => {
          setProjectData({
            ...LOADING_PROJECT,
            id: projectId,
            name: result.name,
            ticker: result.tokenSymbol || result.name.substring(0, 4).toUpperCase(),
            category: `k/${result.type.toLowerCase()}`,
            aiVerdict: result.status === 'VERIFIED' ? 'bullish' : result.status === 'RISKY' ? 'bearish' : 'neutral',
            aiScore: result.score * 20,
            aiSummary: result.summary,
            keyPoints: result.features,
            riskWarnings: result.warnings,
            audits: result.audits,
            investors: result.investors,
            funding: result.funding,
            maAtStatus: result.status,
          })
        })
        return
      }

      const result = createResult.analysis
      const fullData = {
        ...LOADING_PROJECT,
        id: createResult.project?.id || projectId,
        name: result.name,
        ticker: result.tokenSymbol || result.name.substring(0, 4).toUpperCase(),
        category: createResult.project?.category || `k/${result.type.toLowerCase()}`,
        price: result.tokenPrice || '-',
        marketCap: result.tvl || '-',
        volume24h: '-',
        image: result.image,
        aiVerdict: result.status === 'VERIFIED' ? 'bullish' : result.status === 'RISKY' ? 'bearish' : 'neutral',
        aiScore: result.score * 20,
        aiSummary: result.summary,
        keyPoints: result.features,
        riskWarnings: result.warnings,
        audits: result.audits,
        investors: result.investors,
        funding: result.funding,
        maAtStatus: result.status,
      }
      
      setProjectData(fullData)

      addProject({
        id: createResult.project?.id || projectId,
        name: result.name,
        ticker: result.tokenSymbol || "UNK",
        category: result.type,
        score: result.score,
        tvl: result.tvl,
        reviewsCount: 0,
        logo: result.image
      })
    })
  }, [projectId, addProject, initialProject])

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
               {data.id === 'loading' && (
                 <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />
               )}
               {data.image ? (
                 <Image 
                   src={data.image} 
                   alt={data.name} 
                   width={96} 
                   height={96}
                   className="absolute inset-0 w-full h-full object-contain p-2"
                 />
               ) : (
                 data.name[0]?.toUpperCase() || '?'
               )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  {data.name}
                  {data === projectData && data.id !== 'loading' && (
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
                <span>{data.category}</span>
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
            reviewCount={reviews.length}
            totalStaked={reviews.reduce((sum, r) => sum + parseFloat(r.stakeAmount || '0'), 0).toString()}
          />

          {/* Funding & Risk Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Funding Info */}
            {data.funding && (
              <div className="p-4 rounded-xl bg-[#1a1a1d] border border-green-500/20">
                <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                  💰 Funding Information
                </h3>
                <div className="space-y-3">
                  {data.funding.totalRaised && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase">Total Raised</span>
                      <span className="text-lg font-bold text-green-400">{data.funding.totalRaised}</span>
                    </div>
                  )}
                  {data.funding.valuation && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase">Valuation</span>
                      <span className="text-md font-semibold text-gray-300">{data.funding.valuation}</span>
                    </div>
                  )}
                  {data.funding.lastRound && (
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-400 uppercase block mb-1">Latest Round</span>
                      <span className="text-sm text-gray-300">{data.funding.lastRound}</span>
                    </div>
                  )}
                  {data.funding.rounds && data.funding.rounds.length > 0 && (
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-400 uppercase block mb-2">Funding Rounds</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {data.funding.rounds.map((round: any, i: number) => (
                          <div key={i} className="bg-black/20 p-2 rounded text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white">{round.round}</span>
                              <span className="text-green-400 font-bold">{round.amount}</span>
                            </div>
                            {round.date && <div className="text-gray-500">{round.date}</div>}
                            {round.investors && round.investors.length > 0 && (
                              <div className="text-gray-400 mt-1">
                                {round.investors.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ma'at Risk Analysis */}
            {(data.riskWarnings?.length > 0 || data.audits?.length > 0) && (
              <div className="p-4 rounded-xl bg-[#1a1a1d] border border-yellow-500/20">
                <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  ⚠️ Ma'at Risk Analysis
                </h3>
                <div className="space-y-3">
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
                     <div className={data.riskWarnings?.length > 0 ? 'pt-3 border-t border-gray-700' : ''}>
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
          </div>

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
              reviews.map((review: any) => (
                <div key={review.id} className="flex gap-4 bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
                  {/* Vote Column (Interactive) */}
                  <StakeVote
                    reviewId={review.id}
                    initialUpvotes={review.upvotes}
                    initialDownvotes={review.downvotes}
                    totalStaked={review.stakeAmount}
                    earlyBird={review.upvotes + review.downvotes < 20}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-xs text-[#6b6b70] mb-2 flex-wrap">
                      <span>by {review.reviewerAddress.slice(0, 6)}...{review.reviewerAddress.slice(-4)}</span>
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-[#2a2a2e]'}>
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-[#6b6b70] ml-1">{review.rating}/5</span>
                    </div>

                    {/* Content */}
                    <p className="text-[#adadb0] text-sm leading-relaxed whitespace-pre-wrap">
                      {review.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block">
           <CommunityInfo category={`k/${category}`} />
           
           {/* Project Stats Widget */}
           <div className="w-80 mt-6 bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
              <h3 className="font-semibold mb-4 text-sm text-gray-400 uppercase">Market Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Price</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{tokenPrice?.price || data.price || '-'}</span>
                    {tokenPrice?.priceChange24h && (
                      <span className={`text-xs ${parseFloat(tokenPrice.priceChange24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(tokenPrice.priceChange24h) >= 0 ? '↑' : '↓'}{tokenPrice.priceChange24h}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">24h Vol</span>
                  <span className="font-mono">{tokenPrice?.volume24h || data.volume24h || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Market Cap</span>
                  <span className="font-mono">{tokenPrice?.marketCap || data.marketCap || '-'}</span>
                </div>
              </div>
              {tokenPrice && (
                <div className="mt-3 pt-3 border-t border-[#1f1f23]">
                  <span className="text-[10px] text-gray-600">via CoinGecko • Live</span>
                </div>
              )}
           </div>
        </div>
      </div>
    </main>
  )
}
