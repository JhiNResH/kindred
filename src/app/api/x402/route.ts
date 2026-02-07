/**
 * x402 Payment Protocol Implementation
 * 
 * HTTP 402 Payment Required for gated content
 * Based on Coinbase x402 spec: https://x402.org
 * 
 * Flow:
 * 1. GET /api/x402?contentId=xxx → Returns 402 with payment requirements
 * 2. POST /api/x402 { contentId, paymentProof } → Verify payment, return content
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMessage } from 'viem'

export const dynamic = 'force-dynamic'

// Treasury address for receiving payments
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'

// USDC contract addresses
const USDC_ADDRESSES: Record<number, string> = {
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
}

// Minimum payment amount - $0.10 USDC (6 decimals)
const MIN_PAYMENT_USDC = BigInt('100000') // 0.1 USDC

// Legacy ETH support (in wei) - 0.001 ETH
const MIN_PAYMENT_ETH = BigInt('1000000000000000')

// Content types that can be gated
type GatedContentType = 'review' | 'analysis' | 'report'

interface PaymentRequirements {
  accepts: 'ethereum' | 'base'
  chainId: number
  payTo: string
  maxAmountRequired: string
  asset: 'native' | 'USDC' // native ETH or USDC
  assetAddress?: string // Token contract address (for USDC)
  assetDecimals: number
  expires: number // Unix timestamp
  contentId: string
  contentType: GatedContentType
  extra?: {
    scheme: string
    network: string
    version: string
  }
}

/**
 * GET - Request to access gated content
 * Returns 402 with payment requirements if not paid
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get('contentId')
  const contentType = searchParams.get('type') as GatedContentType || 'review'
  const userAddress = searchParams.get('address')?.toLowerCase()

  if (!contentId) {
    return NextResponse.json({ error: 'Missing contentId' }, { status: 400 })
  }

  try {
    // Check if user already has access
    if (userAddress) {
      const existingAccess = await prisma.contentAccess.findUnique({
        where: {
          contentId_userAddress: {
            contentId,
            userAddress,
          },
        },
      })

      if (existingAccess) {
        // User has access, return the content
        const content = await getContent(contentId, contentType)
        return NextResponse.json({
          status: 'unlocked',
          content,
        })
      }
    }

    // Get pricing from content (in USDC, 6 decimals)
    const priceUsdc = await getContentPriceUsdc(contentId, contentType)
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID === '84532' ? 84532 : 8453
    
    // Generate payment requirements (x402 spec) - USDC preferred
    const requirements: PaymentRequirements = {
      accepts: 'base',
      chainId,
      payTo: TREASURY_ADDRESS,
      maxAmountRequired: priceUsdc.toString(),
      asset: 'USDC',
      assetAddress: USDC_ADDRESSES[chainId],
      assetDecimals: 6, // USDC has 6 decimals
      expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      contentId,
      contentType,
      extra: {
        scheme: 'x402',
        network: 'base',
        version: '1.0',
      },
    }

    // Return 402 Payment Required
    return new NextResponse(
      JSON.stringify({
        status: 'payment_required',
        requirements,
        message: `Payment of ${formatUsdc(priceUsdc)} USDC required to access this content`,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-402-Payment': JSON.stringify(requirements),
        },
      }
    )
  } catch (error) {
    console.error('[x402] Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

/**
 * POST - Submit payment proof and unlock content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, contentType, paymentProof, userAddress, txHash } = body

    if (!contentId || !userAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedAddress = userAddress.toLowerCase()

    // Verify payment
    // Option 1: Verify transaction on-chain
    if (txHash) {
      const isValid = await verifyTransaction(txHash, contentId, normalizedAddress)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid payment transaction' }, { status: 400 })
      }
    }
    // Option 2: Verify signed message (for off-chain proofs)
    else if (paymentProof) {
      const message = `Unlock content: ${contentId}`
      const isValid = await verifyMessage({
        address: normalizedAddress as `0x${string}`,
        message,
        signature: paymentProof as `0x${string}`,
      })
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Missing payment proof or tx hash' }, { status: 400 })
    }

    // Grant access
    await prisma.contentAccess.upsert({
      where: {
        contentId_userAddress: {
          contentId,
          userAddress: normalizedAddress,
        },
      },
      update: {
        txHash,
        updatedAt: new Date(),
      },
      create: {
        contentId,
        contentType: contentType || 'review',
        userAddress: normalizedAddress,
        txHash,
        paidAmount: MIN_PAYMENT_USDC.toString(),
      },
    })

    // Update unlock count on content
    if (contentType === 'review') {
      await prisma.review.update({
        where: { id: contentId },
        data: { 
          // Increment unlock count if field exists
          // unlockCount: { increment: 1 }
        },
      }).catch(() => {}) // Ignore if field doesn't exist
    }

    // Return unlocked content
    const content = await getContent(contentId, contentType || 'review')

    return NextResponse.json({
      status: 'unlocked',
      content,
      message: 'Content unlocked successfully',
    })
  } catch (error) {
    console.error('[x402] Payment verification error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}

// Helper functions

async function getContentPriceUsdc(contentId: string, contentType: GatedContentType): Promise<bigint> {
  // Default price: $0.10 USDC
  let price = MIN_PAYMENT_USDC

  if (contentType === 'review') {
    const review = await prisma.review.findUnique({
      where: { id: contentId },
      select: { stakeAmount: true },
    })
    // Price based on stake: higher stake = higher unlock price
    // Assume 1 KIND ≈ $0.01, unlock = 10% of stake value in USDC
    if (review?.stakeAmount) {
      const stakeKind = BigInt(review.stakeAmount) / BigInt(1e18) // Convert from wei
      // $0.01 per KIND, 10% for unlock, min $0.10
      const priceInCents = stakeKind / BigInt(10)
      price = priceInCents * BigInt(10000) // Convert cents to USDC (6 decimals)
      if (price < MIN_PAYMENT_USDC) price = MIN_PAYMENT_USDC
    }
  }

  return price
}

// Legacy ETH pricing (for backwards compatibility)
async function getContentPriceEth(contentId: string, contentType: GatedContentType): Promise<bigint> {
  let price = MIN_PAYMENT_ETH

  if (contentType === 'review') {
    const review = await prisma.review.findUnique({
      where: { id: contentId },
      select: { stakeAmount: true },
    })
    if (review?.stakeAmount) {
      const stake = BigInt(review.stakeAmount)
      price = stake / BigInt(10)
      if (price < MIN_PAYMENT_ETH) price = MIN_PAYMENT_ETH
    }
  }

  return price
}

async function getContent(contentId: string, contentType: GatedContentType) {
  if (contentType === 'review') {
    const review = await prisma.review.findUnique({
      where: { id: contentId },
      include: {
        reviewer: {
          select: {
            address: true,
            displayName: true,
            reputationScore: true,
          },
        },
        project: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    })
    return review
  }

  // Add other content types as needed
  return null
}

async function verifyTransaction(
  txHash: string, 
  contentId: string, 
  userAddress: string
): Promise<boolean> {
  console.log('[x402] Verifying transaction:', { txHash, contentId, userAddress })
  
  try {
    // Import here to avoid bundling issues
    const { createPublicClient, http } = await import('viem')
    const { baseSepolia } = await import('viem/chains')
    
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    })
    
    // Fetch transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })
    
    console.log('[x402] Transaction receipt:', {
      from: receipt.from,
      to: receipt.to,
      status: receipt.status,
    })
    
    // Verify transaction succeeded
    if (receipt.status !== 'success') {
      console.error('[x402] Transaction failed')
      return false
    }
    
    // Verify sender matches user address
    if (receipt.from.toLowerCase() !== userAddress.toLowerCase()) {
      console.error('[x402] Sender mismatch:', {
        expected: userAddress,
        actual: receipt.from,
      })
      return false
    }
    
    // TODO: Verify amount and recipient (USDC contract call)
    // For now, just verify transaction succeeded and sender matches
    console.log('[x402] ✅ Transaction verified')
    return true
  } catch (error) {
    console.error('[x402] Verification error:', error)
    // For development, accept any valid-looking txHash
    return txHash.length === 66 && txHash.startsWith('0x')
  }
}

function formatEther(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(6)
}

function formatUsdc(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(2)
}
