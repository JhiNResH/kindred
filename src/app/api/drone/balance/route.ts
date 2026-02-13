import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/scarab/balance?address=0x...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const normalizedAddress = address.toLowerCase()
    const user = await prisma.user.findUnique({
      where: { address: normalizedAddress },
      select: { scarabBalance: true }
    })

    if (!user) {
      return NextResponse.json({ scarabBalance: 0 })
    }

    return NextResponse.json({ scarabBalance: user.scarabBalance })
  } catch (error) {
    console.error('Error fetching Scarab balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
