import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address || !address.startsWith('0x')) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const normalizedAddress = address.toLowerCase()

  try {
    const user = await prisma.user.findUnique({
      where: { address: normalizedAddress },
      include: {
        reviews: {
          select: { id: true, stakeAmount: true }
        }
      }
    })

    if (!user) {
      // Return default stats for new users
      return NextResponse.json({
        exp: 0,
        reputation: 0,
        reviewCount: 0,
        verifiedReviews: 0,
        totalStaked: 0,
        totalUpvotes: 0,
        currentStreak: 0,
        longestStreak: 0,
      })
    }

    // Calculate verified reviews (reviews with stake > 0)
    const verifiedReviews = user.reviews?.filter(
      r => r.stakeAmount && BigInt(r.stakeAmount) > 0
    ).length || 0

    // Parse totalStaked from string to number
    const totalStaked = Math.floor(Number(user.totalStaked) / 1e18) // Convert from wei

    return NextResponse.json({
      exp: user.exp,
      reputation: user.reputationScore,
      reviewCount: user.totalReviews,
      verifiedReviews: user.verifiedReviews,
      totalStaked,
      totalUpvotes: user.totalUpvotes,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

// POST - Daily check-in
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address || !address.startsWith('0x')) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const normalizedAddress = address.toLowerCase()

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let user = await prisma.user.findUnique({
      where: { address: normalizedAddress }
    })

    if (!user) {
      // Create new user with first check-in
      user = await prisma.user.create({
        data: {
          address: normalizedAddress,
          exp: 5, // DAILY_CHECK_IN reward
          currentStreak: 1,
          longestStreak: 1,
          lastCheckIn: now,
        }
      })
      return NextResponse.json({
        success: true,
        expGained: 5,
        currentStreak: 1,
        message: 'First check-in! Welcome to Maat!'
      })
    }

    // Check if already checked in today
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
          message: 'Already checked in today!',
          currentStreak: user.currentStreak
        })
      }

      // Check if streak continues (checked in yesterday)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const isConsecutive = lastCheckInDay.getTime() === yesterday.getTime()
      const newStreak = isConsecutive ? user.currentStreak + 1 : 1
      const newLongestStreak = Math.max(newStreak, user.longestStreak)

      // Calculate bonus EXP for streaks
      let expGained = 5 // Base DAILY_CHECK_IN
      let bonusMessage = ''

      if (newStreak === 3) {
        expGained += 10 // STREAK_BONUS_3
        bonusMessage = ' + 3-day streak bonus!'
      } else if (newStreak === 7) {
        expGained += 25 // STREAK_BONUS_7
        bonusMessage = ' + 7-day streak bonus!'
      } else if (newStreak === 30) {
        expGained += 100 // STREAK_BONUS_30
        bonusMessage = ' + 30-day streak bonus!'
      }

      await prisma.user.update({
        where: { address: normalizedAddress },
        data: {
          exp: user.exp + expGained,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastCheckIn: now,
        }
      })

      return NextResponse.json({
        success: true,
        expGained,
        currentStreak: newStreak,
        message: `Check-in complete!${bonusMessage}`
      })
    }

    // First check-in for existing user
    await prisma.user.update({
      where: { address: normalizedAddress },
      data: {
        exp: user.exp + 5,
        currentStreak: 1,
        longestStreak: Math.max(1, user.longestStreak),
        lastCheckIn: now,
      }
    })

    return NextResponse.json({
      success: true,
      expGained: 5,
      currentStreak: 1,
      message: 'Check-in complete!'
    })
  } catch (error) {
    console.error('Error during check-in:', error)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
