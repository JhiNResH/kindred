import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/drone/claim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const normalizedAddress = address.toLowerCase()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { address: normalizedAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: normalizedAddress,
          droneBalance: 100,
          lastCheckIn: now,
        }
      })
      return NextResponse.json({
        success: true,
        droneEarned: 100,
        newBalance: 100,
        message: 'First time claim! Welcome to Kindred!'
      })
    }

    // Check if already claimed today
    if (user.lastCheckIn) {
      const lastCheckInDate = new Date(user.lastCheckIn)
      const lastCheckInDay = new Date(
        lastCheckInDate.getFullYear(),
        lastCheckInDate.getMonth(),
        lastCheckInDate.getDate()
      )

      if (lastCheckInDay.getTime() === today.getTime()) {
        return NextResponse.json({
          success: false,
          message: 'Already claimed DRONE today! Come back tomorrow.',
          currentBalance: user.droneBalance
        }, { status: 400 })
      }
    }

    // Award 100 DRONE
    const newBalance = user.droneBalance + 100
    await prisma.user.update({
      where: { address: normalizedAddress },
      data: {
        droneBalance: newBalance,
        lastCheckIn: now,
      }
    })

    return NextResponse.json({
      success: true,
      droneEarned: 100,
      newBalance,
      message: 'Daily DRONE claimed successfully!'
    })
  } catch (error) {
    console.error('Error claiming DRONE:', error)
    return NextResponse.json({ error: 'Failed to claim DRONE' }, { status: 500 })
  }
}
