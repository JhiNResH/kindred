/**
 * Balance API - Fetch ETH + USDC balance for a wallet address
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { baseSepolia, base } from 'viem/chains'

export const dynamic = 'force-dynamic'

// USDC contract addresses
const USDC_ADDRESSES: Record<number, string> = {
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
}

// Use environment variable or default to Base Sepolia
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 8453 : 84532
const CHAIN = CHAIN_ID === 8453 ? base : baseSepolia

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    console.log('[Balance API] Fetching for:', address, 'on', CHAIN.name)

    // Create public client
    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(),
    })

    // Fetch ETH balance
    const ethBalance = await publicClient.getBalance({
      address: address as `0x${string}`,
    })
    const ethFormatted = parseFloat(formatEther(ethBalance)).toFixed(4)

    console.log('[Balance API] ETH balance:', ethFormatted)

    // Fetch USDC balance
    const USDC_ADDRESS = USDC_ADDRESSES[CHAIN_ID]
    let usdcFormatted = '0.00'

    try {
      const usdcBalance = await publicClient.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
          },
        ],
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })

      // USDC has 6 decimals
      usdcFormatted = (Number(usdcBalance) / 1e6).toFixed(2)
      console.log('[Balance API] USDC balance:', usdcFormatted)
    } catch (usdcError) {
      console.error('[Balance API] USDC fetch failed:', usdcError)
      // Return 0.00 if USDC fetch fails (wallet might not have USDC)
    }

    return NextResponse.json({
      address,
      chain: CHAIN.name,
      chainId: CHAIN_ID,
      eth: ethFormatted,
      usdc: usdcFormatted,
    })
  } catch (error) {
    console.error('[Balance API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}
