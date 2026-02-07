/**
 * Reputation API - Fetch user's reputation score from ReputationOracle
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACTS } from '@/lib/contracts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    console.log('[Reputation API] Fetching score for:', address)

    // Create public client
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    })

    // Read reputation score from ReputationOracle
    const score = await publicClient.readContract({
      address: CONTRACTS.baseSepolia.reputationOracle.address,
      abi: CONTRACTS.baseSepolia.reputationOracle.abi,
      functionName: 'getScore',
      args: [address as `0x${string}`],
    })

    const scoreNumber = Number(score)
    console.log('[Reputation API] Score:', scoreNumber)

    return NextResponse.json({
      address,
      score: scoreNumber,
      tier: scoreNumber >= 850 ? 'high' : scoreNumber >= 600 ? 'medium' : scoreNumber >= 100 ? 'low' : 'blocked',
      fee: scoreNumber >= 850 ? 0.15 : scoreNumber >= 600 ? 0.22 : 0.30,
    })
  } catch (error) {
    console.error('[Reputation API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reputation' },
      { status: 500 }
    )
  }
}
