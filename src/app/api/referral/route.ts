import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, Abi } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACTS } from '@/lib/contracts'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
})

/**
 * GET /api/referral?address=0x...
 * Returns referral info for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    // Query MaatHookV2 contract
    const hookAddress = CONTRACTS.baseSepolia.kindredHookV2.address
    const hookABI = CONTRACTS.baseSepolia.kindredHookV2.abi as Abi

    // Get referral info from contract
    const [referrer, referralCount, pendingRewards] = await client.readContract({
      address: hookAddress,
      abi: hookABI,
      functionName: 'getReferralInfo',
      args: [address as `0x${string}`],
    }) as [string, bigint, bigint]

    // Get reputation from oracle
    const oracleAddress = CONTRACTS.baseSepolia.reputationOracle.address
    const oracleABI = CONTRACTS.baseSepolia.reputationOracle.abi as Abi

    const reputation = await client.readContract({
      address: oracleAddress,
      abi: oracleABI,
      functionName: 'getScore',
      args: [address as `0x${string}`],
    }) as bigint

    // Calculate eligibility
    const canRefer = Number(reputation) >= 700
    const referralUrl = `https://kindred.app/?ref=${address}`

    return NextResponse.json({
      address,
      referrer: referrer !== '0x0000000000000000000000000000000000000000' ? referrer : null,
      referralCount: Number(referralCount),
      pendingRewards: pendingRewards.toString(),
      reputation: Number(reputation),
      canRefer,
      referralUrl: canRefer ? referralUrl : null,
    })
  } catch (error) {
    console.error('[Referral API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral info', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/referral
 * Set referrer for an address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, referrer } = body

    if (!address || !referrer) {
      return NextResponse.json(
        { error: 'Address and referrer required' },
        { status: 400 }
      )
    }

    // Validate referrer reputation
    const oracleAddress = CONTRACTS.baseSepolia.reputationOracle.address
    const oracleABI = CONTRACTS.baseSepolia.reputationOracle.abi as Abi

    const referrerReputation = await client.readContract({
      address: oracleAddress,
      abi: oracleABI,
      functionName: 'getScore',
      args: [referrer as `0x${string}`],
    }) as bigint

    if (Number(referrerReputation) < 700) {
      return NextResponse.json(
        { error: 'Referrer reputation too low (minimum 700)' },
        { status: 400 }
      )
    }

    // Return transaction data (user must call contract directly)
    return NextResponse.json({
      success: true,
      message: 'Referrer validated. Call setReferrer() on MaatHookV2 contract.',
      contract: CONTRACTS.baseSepolia.kindredHookV2.address,
      referrer,
    })
  } catch (error) {
    console.error('[Referral API] POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to process referral', details: (error as Error).message },
      { status: 500 }
    )
  }
}
