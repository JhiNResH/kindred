/**
 * GET /api/recommendations
 * 
 * Phase 2 API - Agent decision support
 * Helps agents decide what to predict, review, or focus on
 * 
 * Used in Moltiverse for autonomous agent strategy selection
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Recommendation {
  id: string
  type: 'high_opportunity_market' | 'low_competition_market' | 'emerging_trend' | 'verification_gap'
  market?: string
  reason: string
  confidence: number // 0-100
  expectedReward: number // Estimated Scarab earnings
  effortLevel: 'low' | 'medium' | 'high'
  timelineWeeks: number
  competitorCount: number
  action: string // Suggested action for agent
}

interface RecommendationResponse {
  timestamp: number
  agentAddress?: string
  isAgent: boolean
  recommendations: Recommendation[]
  strategy: {
    focusArea: string
    nextSteps: string[]
    estimatedRewardWeekly: number
  }
  marketOverview: {
    totalActiveMarkets: number
    avgCompetitorCount: number
    highOpportunityCount: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentAddress = searchParams.get('agent')

    // Fetch current market state
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        reviewCount: true,
        mindshareScore: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { mindshareScore: 'desc' },
      take: 50,
    })

    const allReviews = await prisma.review.findMany({
      select: { projectId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    // Analyze opportunities
    const recommendations: Recommendation[] = []

    // 1. Low-competition markets (few reviews)
    const lowCompetition = projects
      .filter(p => p.reviewCount < 5)
      .slice(0, 3)
      .map((project, idx) => ({
        id: `low-comp-${idx}`,
        type: 'low_competition_market' as const,
        market: project.name,
        reason: `${project.name} has only ${project.reviewCount} reviews - first-mover advantage`,
        confidence: Math.min(80, 50 + project.reviewCount * 5),
        expectedReward: 50 + project.reviewCount * 10,
        effortLevel: 'low' as const,
        timelineWeeks: 1,
        competitorCount: project.reviewCount,
        action: `Review ${project.name} and establish baseline reputation`,
      }))

    // 2. High-mindshare markets (trending)
    const trending = projects
      .filter(p => p.mindshareScore > 1000 && p.reviewCount < 20)
      .slice(0, 2)
      .map((project, idx) => ({
        id: `trending-${idx}`,
        type: 'high_opportunity_market' as const,
        market: project.name,
        reason: `${project.name} has high mindshare (${Math.round(project.mindshareScore)}) but fewer reviews than competitors`,
        confidence: 85,
        expectedReward: 100,
        effortLevel: 'medium' as const,
        timelineWeeks: 2,
        competitorCount: project.reviewCount,
        action: `Become a verified expert on ${project.name}`,
      }))

    // 3. Emerging category insight (DeFi protocols)
    const defiProjects = projects.filter(p => p.category === 'k/defi')
    const emergingTrend: Recommendation = {
      id: 'defi-trend-emerging',
      type: 'emerging_trend',
      market: 'DeFi Protocol Safety',
      reason: `${defiProjects.length} DeFi projects with variable review quality - expert positioning opportunity`,
      confidence: 90,
      expectedReward: 200,
      effortLevel: 'high',
      timelineWeeks: 4,
      competitorCount: Math.round(defiProjects.reduce((a, p) => a + p.reviewCount, 0) / defiProjects.length),
      action: 'Become a DeFi safety specialist - predict weekly DeFi protocol rankings',
    }

    // 4. Verification gap (projects without on-chain proof)
    const verificationGap: Recommendation = {
      id: 'verification-gap',
      type: 'verification_gap',
      market: 'Multi-chain Verification',
      reason: 'Many projects lack verification across multiple chains - arbitrage opportunity',
      confidence: 75,
      expectedReward: 150,
      effortLevel: 'high',
      timelineWeeks: 3,
      competitorCount: 5,
      action: 'Build multi-chain verification authority - verify projects on Ethereum, Solana, and Base',
    }

    recommendations.push(...lowCompetition)
    recommendations.push(...trending)
    recommendations.push(emergingTrend)
    recommendations.push(verificationGap)

    // Sort by expected reward / effort ratio
    recommendations.sort((a, b) => {
      const aRatio = a.expectedReward / (a.effortLevel === 'low' ? 1 : a.effortLevel === 'medium' ? 2 : 3)
      const bRatio = b.expectedReward / (b.effortLevel === 'low' ? 1 : b.effortLevel === 'medium' ? 2 : 3)
      return bRatio - aRatio
    })

    // Generate strategy
    const topRecommendation = recommendations[0]
    const strategy = {
      focusArea: topRecommendation?.market || 'DeFi Protocol Safety',
      nextSteps: [
        'Start with low-competition markets to build initial reputation',
        'Establish expertise in DeFi protocol safety assessment',
        'Participate in multi-chain verification to build trust score',
        'Target 75+ trust score within 4 weeks for lower Hook fees',
      ],
      estimatedRewardWeekly: Math.round(
        recommendations.reduce((sum, r) => sum + r.expectedReward / r.timelineWeeks, 0) / recommendations.length
      ),
    }

    // Calculate market overview
    const totalProjects = projects.length
    const avgReviewCount = Math.round(projects.reduce((sum, p) => sum + p.reviewCount, 0) / totalProjects)
    const highOpportunity = projects.filter(p => p.reviewCount < avgReviewCount / 2).length

    const response: RecommendationResponse = {
      timestamp: Date.now(),
      agentAddress,
      isAgent: !!agentAddress,
      recommendations: recommendations.slice(0, 5),
      strategy,
      marketOverview: {
        totalActiveMarkets: totalProjects,
        avgCompetitorCount: avgReviewCount,
        highOpportunityCount: highOpportunity,
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour
      },
    })
  } catch (error) {
    console.error('[Recommendations API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}
