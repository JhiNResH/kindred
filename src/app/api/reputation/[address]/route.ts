/**
 * GET /api/reputation/:address
 * 
 * Phase 2 API - Enhanced reputation endpoint
 * Used by agents to query creditworthiness before trading
 * 
 * Returns multi-dimensional reputation score optimized for agent decision-making
 * Includes: trust score, tier, signals, on-chain verification data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, Abi } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACTS } from '@/lib/contracts'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ReputationResponse {
  address: string
  chain: 'base' | 'base-sepolia'
  isAgent: boolean
  reputation: {
    predictability: number // 0-100, accuracy of predictions
    commentary_quality: number // 0-100, Gemini quality scores
    consistency: number // 0-100, activity frequency
    volatility: number // 0-100, opinion stability
  }
  trustScore: number // 0-100, composite
  tier: 1 | 2 | 3 | 4 | 5 | 6
  primarySignal: string // e.g. "defi_safety_predictor"
  secondarySignals: string[] // e.g. ["low_volatility", "consistent"]
  stakedScarab: number // Total Scarab staked for economic backing
  verifiedProofs: number // Number of on-chain verification proofs
  trustedByCount: number // Number of entities trusting this address
  stats: {
    totalPredictions: number
    correctPredictions: number
    accuracy: number
    avgCommentQuality: number
    predictionFrequency: string // e.g. "3.2/week"
    volatilityScore: number // 0-1, lower = more stable
    lastActiveAt: number // unix timestamp
  }
  semanticContext: {
    primaryExpertise: string // What they excel at predicting
    confidenceLevel: 'high' | 'medium' | 'low'
    strengths: string[]
    weaknesses: string[]
  }
  hookFeeMultiplier: number // Applied to base fee (0.15% min for high-trust)
  recommendedAction: string // Agent decision guidance
  lastUpdatedAt: number
  cacheExpiresAt: number // Suggest refresh after this time
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params

    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/i)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    const checksummed = address.toLowerCase() as `0x${string}`
    const startTime = Date.now()

    // Try to fetch from database cache first (within 5 minutes)
    const cachedRep = await prisma.reputationCache.findUnique({
      where: { address: checksummed },
    })

    const now = Date.now()
    if (cachedRep && now - cachedRep.updatedAt.getTime() < 5 * 60 * 1000) {
      console.log(`[Reputation API] Cache hit for ${address}`)
      return NextResponse.json(
        {
          ...JSON.parse(cachedRep.data),
          _cached: true,
          _cacheAge: Math.floor((now - cachedRep.updatedAt.getTime()) / 1000),
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=300', // 5 minutes
          },
        }
      )
    }

    // Check if address is registered as an agent
    const agent = await prisma.agent.findUnique({
      where: { address: checksummed },
    })

    // Fetch on-chain reputation from ReputationOracle
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    })

    let onChainScore = 0
    try {
      const score = await publicClient.readContract({
        address: CONTRACTS.baseSepolia.reputationOracle.address,
        abi: CONTRACTS.baseSepolia.reputationOracle.abi as Abi,
        functionName: 'getScore',
        args: [checksummed],
      })
      onChainScore = Number(score)
    } catch (e) {
      console.warn(`[Reputation API] Failed to fetch on-chain score: ${e}`)
      onChainScore = 0
    }

    // Fetch user activity from database
    const userStats = await prisma.review.groupBy({
      by: ['authorAddress'],
      where: { authorAddress: checksummed },
      _count: { id: true },
      _avg: { stakeAmount: true },
    })

    const userComments = await prisma.review.findMany({
      where: { authorAddress: checksummed },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const votes = await prisma.vote.findMany({
      where: { voterAddress: checksummed },
      select: { id: true, createdAt: true },
    })

    // Calculate multi-dimensional reputation
    const predictability = calculatePredictability(onChainScore, userComments.length)
    const commentary_quality = calculateQuality(userComments.length, onChainScore)
    const consistency = calculateConsistency(userComments)
    const volatility = calculateVolatility(votes)

    const trustScore = Math.round(
      predictability * 0.4 +
      commentary_quality * 0.3 +
      consistency * 0.2 +
      volatility * 0.1
    )

    // Determine tier based on trustScore
    const tier = getTier(trustScore) as 1 | 2 | 3 | 4 | 5 | 6

    // Generate signals
    const { primarySignal, secondarySignals } = generateSignals(
      trustScore,
      predictability,
      consistency,
      volatility
    )

    // Calculate Hook fee multiplier
    const hookFeeMultiplier = calculateFeeMultiplier(tier)

    // Generate semantic context
    const semanticContext = {
      primaryExpertise:
        primarySignal === 'defi_safety_predictor'
          ? 'DeFi Protocol Safety & Risk Assessment'
          : 'General Market Prediction',
      confidenceLevel: trustScore >= 75 ? ('high' as const) : trustScore >= 50 ? ('medium' as const) : ('low' as const),
      strengths:
        consistency > 70
          ? ['Reliable', 'Frequent contributor', 'Consistent predictions']
          : ['Growing participation'],
      weaknesses:
        volatility > 50
          ? ['Opinion volatility', 'Inconsistent signals']
          : [],
    }

    // Determine recommended action
    const recommendedAction =
      tier >= 5
        ? 'PRIORITIZE: Execute with lower fees'
        : tier >= 3
        ? 'SAFE: Execute with standard fees'
        : 'CAUTION: Execute with higher slippage protection'

    const response: ReputationResponse = {
      address: checksummed,
      chain: 'base-sepolia',
      isAgent: !!agent,
      reputation: {
        predictability,
        commentary_quality,
        consistency,
        volatility,
      },
      trustScore,
      tier,
      primarySignal,
      secondarySignals,
      stakedScarab: Math.round(userStats[0]?._avg.stakeAmount || 0),
      verifiedProofs: agent?.verifiedProofs || 0,
      trustedByCount: userComments.length > 0 ? Math.min(votes.length, 100) : 0,
      stats: {
        totalPredictions: userComments.length,
        correctPredictions: Math.round(predictability * userComments.length * 0.01),
        accuracy: predictability / 100,
        avgCommentQuality: commentary_quality / 100,
        predictionFrequency: calculateFrequency(userComments),
        volatilityScore: volatility / 100,
        lastActiveAt: Math.floor(
          (userComments[0]?.createdAt.getTime() || Date.now()) / 1000
        ),
      },
      semanticContext,
      hookFeeMultiplier,
      recommendedAction,
      lastUpdatedAt: Date.now(),
      cacheExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    }

    // Cache the response
    await prisma.reputationCache.upsert({
      where: { address: checksummed },
      update: {
        data: JSON.stringify(response),
        updatedAt: new Date(),
      },
      create: {
        address: checksummed,
        data: JSON.stringify(response),
      },
    })

    const duration = Date.now() - startTime

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'X-Computation-Time': `${duration}ms`,
      },
    })
  } catch (error) {
    console.error('[Reputation API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch reputation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

// Helper functions
function calculatePredictability(
  onChainScore: number,
  commentCount: number
): number {
  if (commentCount === 0) return 20
  const scoreComponent = Math.min(onChainScore / 10, 100)
  const frequencyBonus = Math.min(commentCount * 2, 30)
  return Math.round(Math.min(scoreComponent + frequencyBonus, 100))
}

function calculateQuality(commentCount: number, onChainScore: number): number {
  if (commentCount === 0) return 30
  const baseQuality = Math.min(onChainScore / 10, 100)
  const volumeAdjustment = commentCount > 10 ? 5 : 0
  return Math.round(Math.min(baseQuality + volumeAdjustment, 100))
}

function calculateConsistency(comments: { createdAt: Date }[]): number {
  if (comments.length === 0) return 0
  if (comments.length < 3) return 20
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentCount = comments.filter(c => c.createdAt > thirtyDaysAgo).length
  const consistency = Math.min((recentCount / comments.length) * 100, 100)
  
  return Math.round(consistency)
}

function calculateVolatility(votes: { createdAt: Date }[]): number {
  if (votes.length === 0) return 50
  
  const last7Days = votes.filter(
    v => v.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length
  
  const volatilityScore = Math.min((last7Days / Math.max(votes.length, 1)) * 100, 100)
  
  return Math.round(volatilityScore)
}

function getTier(trustScore: number): number {
  if (trustScore >= 90) return 6
  if (trustScore >= 75) return 5
  if (trustScore >= 60) return 4
  if (trustScore >= 45) return 3
  if (trustScore >= 30) return 2
  return 1
}

function calculateFeeMultiplier(tier: number): number {
  const multipliers: { [key: number]: number } = {
    6: 0.15,  // 0.15% (minimum)
    5: 0.22,
    4: 0.30,
    3: 0.45,
    2: 0.60,
    1: 0.80,  // 0.80% (maximum)
  }
  return multipliers[tier] || 0.30
}

function generateSignals(
  trustScore: number,
  predictability: number,
  consistency: number,
  volatility: number
): { primarySignal: string; secondarySignals: string[] } {
  const signals: string[] = []

  if (predictability > 75) signals.push('high_accuracy')
  if (consistency > 70) signals.push('consistent')
  if (volatility < 50) signals.push('low_volatility')
  if (trustScore >= 75) signals.push('verified_trader')

  return {
    primarySignal:
      predictability > 70
        ? 'defi_safety_predictor'
        : trustScore >= 60
        ? 'verified_reviewer'
        : 'emerging_contributor',
    secondarySignals: signals.slice(0, 3),
  }
}

function calculateFrequency(comments: { createdAt: Date }[]): string {
  if (comments.length === 0) return '0/week'
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recent = comments.filter(c => c.createdAt > thirtyDaysAgo).length
  const weeksActive = Math.max(1, Math.floor(recent / 7))
  const frequency = (recent / weeksActive).toFixed(1)
  
  return `${frequency}/week`
}
