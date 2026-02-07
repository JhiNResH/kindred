/**
 * API Route: Circle Gasless Transactions
 * Handles gas sponsorship via Paymaster
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSponsoredTransaction, shouldSponsorOperation } from '@/lib/circle/paymaster'
import { executeUserTransaction } from '@/lib/circle/user-wallet'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletId, to, data, operation = 'unknown' } = body
    
    // Validate inputs
    if (!walletId || !to || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if operation is eligible for sponsorship
    if (!shouldSponsorOperation(operation)) {
      return NextResponse.json(
        { error: `Operation "${operation}" not eligible for gas sponsorship` },
        { status: 403 }
      )
    }
    
    // Create sponsored user operation
    const userOp = await createSponsoredTransaction({
      from: walletId,
      to,
      data,
      operation,
    })
    
    if (!userOp) {
      return NextResponse.json(
        { error: 'Failed to create sponsored transaction' },
        { status: 500 }
      )
    }
    
    // Execute the transaction
    const result = await executeUserTransaction(walletId, {
      to,
      data,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Transaction failed' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      sponsored: true,
      operation,
    })
  } catch (error) {
    console.error('Gasless transaction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET: Check if an operation would be sponsored
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const operation = searchParams.get('operation')
  
  if (!operation) {
    return NextResponse.json(
      { error: 'Missing operation parameter' },
      { status: 400 }
    )
  }
  
  const eligible = shouldSponsorOperation(operation)
  
  return NextResponse.json({
    operation,
    eligible,
  })
}
