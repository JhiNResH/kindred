/**
 * Agent Wallet API
 * 
 * POST /api/agent-wallet - Create or get agent wallet
 * GET /api/agent-wallet?agentId=xxx - Get wallet info and balance
 */

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'
import { agentWalletManager, getWalletBalance, listAgentWallets } from '@/lib/agent-wallet'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * GET - Get wallet info and balance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const action = searchParams.get('action')
    
    // List all wallets
    if (action === 'list') {
      const wallets = await listAgentWallets()
      return NextResponse.json({ wallets }, { headers: corsHeaders })
    }
    
    // Get specific agent wallet
    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId parameter' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    const wallet = await agentWalletManager.getOrCreateWallet(agentId)
    const balance = await agentWalletManager.getBalance(agentId, 'baseSepolia')
    
    return NextResponse.json({
      wallet: {
        id: wallet.id,
        address: wallet.address,
        agentId: wallet.agentId,
      },
      balance: {
        eth: balance.eth,
        wei: balance.wei.toString(),
      },
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Agent wallet GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * POST - Create wallet or execute action
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, agentId, to, amount, message, chainId = 'baseSepolia' } = body
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    switch (action) {
      case 'create':
      case 'get': {
        const wallet = await agentWalletManager.getOrCreateWallet(agentId)
        const balance = await agentWalletManager.getBalance(agentId, chainId)
        
        return NextResponse.json({
          wallet: {
            id: wallet.id,
            address: wallet.address,
            agentId: wallet.agentId,
          },
          balance: {
            eth: balance.eth,
            wei: balance.wei.toString(),
          },
        }, { headers: corsHeaders })
      }
      
      case 'send': {
        if (!to || !amount) {
          return NextResponse.json(
            { error: 'Missing to or amount' },
            { status: 400, headers: corsHeaders }
          )
        }
        
        const result = await agentWalletManager.sendEth(agentId, to, amount, chainId)
        
        return NextResponse.json({
          transaction: {
            hash: result.hash,
            status: result.status,
          },
        }, { headers: corsHeaders })
      }
      
      case 'balance': {
        const balance = await agentWalletManager.getBalance(agentId, chainId)
        
        return NextResponse.json({
          balance: {
            eth: balance.eth,
            wei: balance.wei.toString(),
          },
        }, { headers: corsHeaders })
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400, headers: corsHeaders }
        )
    }
    
  } catch (error) {
    console.error('Agent wallet POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
