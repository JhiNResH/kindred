import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface EtherscanTx {
  from: string
  to: string
  hash: string
  blockNumber: string
  timeStamp: string
}

interface EtherscanResponse {
  status: string
  message: string
  result: EtherscanTx[]
}

// Supported chains with their Etherscan/BlockScout APIs
const CHAIN_APIS: Record<string, { name: string; baseUrl: string; scan: string }> = {
  ethereum: {
    name: 'Ethereum',
    baseUrl: 'https://api.etherscan.io/api',
    scan: 'https://etherscan.io/tx/'
  },
  base: {
    name: 'Base',
    baseUrl: 'https://api.basescan.org/api',
    scan: 'https://basescan.org/tx/'
  },
  polygon: {
    name: 'Polygon',
    baseUrl: 'https://api.polygonscan.com/api',
    scan: 'https://polygonscan.com/tx/'
  },
  arbitrum: {
    name: 'Arbitrum',
    baseUrl: 'https://api.arbiscan.io/api',
    scan: 'https://arbiscan.io/tx/'
  }
}

async function checkChain(
  chain: string,
  userAddress: string,
  projectAddress: string
): Promise<{ used: boolean; txCount: number; chain: string; firstTx?: string }> {
  const chainConfig = CHAIN_APIS[chain.toLowerCase()]
  if (!chainConfig) {
    return { used: false, txCount: 0, chain }
  }

  try {
    const url = new URL(chainConfig.baseUrl)
    url.searchParams.set('module', 'account')
    url.searchParams.set('action', 'txlist')
    url.searchParams.set('address', userAddress.toLowerCase())
    url.searchParams.set('to', projectAddress.toLowerCase())
    url.searchParams.set('sort', 'asc')

    const response = await fetch(url.toString(), { 
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    const data: EtherscanResponse = await response.json()

    if (data.status === '1' && Array.isArray(data.result) && data.result.length > 0) {
      return {
        used: true,
        txCount: data.result.length,
        chain,
        firstTx: data.result[0]?.hash
      }
    }

    return { used: false, txCount: 0, chain }
  } catch (error) {
    console.error(`[verify-usage] ${chain} error:`, error)
    return { used: false, txCount: 0, chain }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userAddress, projectAddress, chains } = await request.json()

    if (!userAddress || !projectAddress) {
      return NextResponse.json(
        { error: 'userAddress and projectAddress required' },
        { status: 400 }
      )
    }

    // Validate addresses
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid user address' },
        { status: 400 }
      )
    }

    if (!projectAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid project address' },
        { status: 400 }
      )
    }

    // Check specified chains or all by default
    const chainsToCheck = chains && Array.isArray(chains) ? chains : ['ethereum', 'base', 'polygon', 'arbitrum']

    // Check all chains in parallel
    const results = await Promise.all(
      chainsToCheck.map(chain => checkChain(chain, userAddress, projectAddress))
    )

    // Aggregate results
    const hasUsed = results.some(r => r.used)
    const totalTxs = results.reduce((sum, r) => sum + r.txCount, 0)
    const usedChains = results.filter(r => r.used)

    return NextResponse.json({
      used: hasUsed,
      totalTransactions: totalTxs,
      chains: results,
      usedOn: usedChains.map(r => r.chain),
      summary: hasUsed 
        ? `User has ${totalTxs} transaction(s) on ${usedChains.map(c => c.chain).join(', ')}`
        : 'No on-chain interactions found'
    })
  } catch (error) {
    console.error('[verify-usage] Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify usage' },
      { status: 500 }
    )
  }
}

// GET endpoint for quick check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get('user')
  const projectAddress = searchParams.get('project')
  const chainsParam = searchParams.get('chains')

  if (!userAddress || !projectAddress) {
    return NextResponse.json(
      { error: 'user and project query params required' },
      { status: 400 }
    )
  }

  const chains = chainsParam ? chainsParam.split(',') : ['ethereum', 'base']

  const results = await Promise.all(
    chains.map(chain => checkChain(chain, userAddress, projectAddress))
  )

  const hasUsed = results.some(r => r.used)

  return NextResponse.json({
    used: hasUsed,
    results
  })
}
