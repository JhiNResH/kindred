const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { address: '0xabcdef1234567890abcdef1234567890abcdef12' },
    update: {},
    create: {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      displayName: 'DeFi Degen',
      reputationScore: 850,
      totalReviews: 42,
      totalUpvotes: 180,
      totalStaked: '50000000000000000000', // 50 ETH
      feeTier: 'trusted',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { address: '0x1111222233334444555566667777888899990000' },
    update: {},
    create: {
      address: '0x1111222233334444555566667777888899990000',
      displayName: 'Ape Trader',
      reputationScore: 620,
      totalReviews: 28,
      totalUpvotes: 95,
      totalStaked: '30000000000000000000', // 30 ETH
      feeTier: 'normal',
    },
  })

  // Create projects
  const hyperliquid = await prisma.project.upsert({
    where: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    update: {},
    create: {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Hyperliquid',
      description: 'High-performance perpetual DEX',
      website: 'https://hyperliquid.xyz',
      category: 'k/perp-dex',
      avgRating: 4.8,
      reviewCount: 2,
      currentRank: 1,
    },
  })

  const aave = await prisma.project.upsert({
    where: { address: '0xdeadbeef1234567890abcdef1234567890abcdef' },
    update: {},
    create: {
      address: '0xdeadbeef1234567890abcdef1234567890abcdef',
      name: 'Aave',
      description: 'Leading DeFi lending protocol',
      website: 'https://aave.com',
      category: 'k/defi',
      avgRating: 4.5,
      reviewCount: 1,
      currentRank: 2,
    },
  })

  // Create reviews
  await prisma.review.create({
    data: {
      rating: 5,
      content: 'Best perp DEX by far. Low fees, fast execution, great UX.',
      predictedRank: 1,
      stakeAmount: '5000000000000000000', // 5 ETH
      upvotes: 42,
      downvotes: 3,
      reviewerId: user1.id,
      projectId: hyperliquid.id,
    },
  })

  await prisma.review.create({
    data: {
      rating: 4,
      content: 'Solid lending protocol. Been using it for 2 years without issues.',
      predictedRank: 2,
      stakeAmount: '10000000000000000000', // 10 ETH
      upvotes: 28,
      downvotes: 5,
      reviewerId: user2.id,
      projectId: aave.id,
    },
  })

  console.log('✅ Seed completed!')
  console.log('  - 2 users')
  console.log('  - 2 projects')
  console.log('  - 2 reviews')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
