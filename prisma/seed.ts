import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { address: '0x1234567890123456789012345678901234567890' },
      update: {},
      create: {
        address: '0x1234567890123456789012345678901234567890',
        displayName: 'CryptoChef',
        reputationScore: 850,
        totalReviews: 24,
        totalUpvotes: 156,
        feeTier: 'elite',
      },
    }),
    prisma.user.upsert({
      where: { address: '0x2345678901234567890123456789012345678901' },
      update: {},
      create: {
        address: '0x2345678901234567890123456789012345678901',
        displayName: 'DeFiDegen',
        reputationScore: 620,
        totalReviews: 15,
        totalUpvotes: 89,
        feeTier: 'trusted',
      },
    }),
    prisma.user.upsert({
      where: { address: '0x3456789012345678901234567890123456789012' },
      update: {},
      create: {
        address: '0x3456789012345678901234567890123456789012',
        displayName: 'FoodieOnChain',
        reputationScore: 450,
        totalReviews: 8,
        totalUpvotes: 42,
        feeTier: 'normal',
      },
    }),
  ])
  console.log(`✅ Created ${users.length} users`)

  // Create DeFi projects
  const defiProjects = await Promise.all([
    prisma.project.upsert({
      where: { address: '0xdefi0001' },
      update: {},
      create: {
        address: '0xdefi0001',
        name: 'Hyperliquid',
        description: 'Perpetual DEX with order book',
        website: 'https://hyperliquid.xyz',
        category: 'k/perp-dex',
        avgRating: 4.5,
        reviewCount: 128,
        totalStaked: '50000000000000000000000',
        currentRank: 1,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xdefi0002' },
      update: {},
      create: {
        address: '0xdefi0002',
        name: 'Aave v3',
        description: 'Decentralized lending protocol',
        website: 'https://aave.com',
        category: 'k/defi',
        avgRating: 4.3,
        reviewCount: 256,
        totalStaked: '75000000000000000000000',
        currentRank: 2,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xdefi0003' },
      update: {},
      create: {
        address: '0xdefi0003',
        name: 'GMX',
        description: 'Decentralized perpetual exchange',
        website: 'https://gmx.io',
        category: 'k/perp-dex',
        avgRating: 4.1,
        reviewCount: 89,
        totalStaked: '32000000000000000000000',
        currentRank: 3,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xdefi0004' },
      update: {},
      create: {
        address: '0xdefi0004',
        name: 'Uniswap v4',
        description: 'AMM with hooks',
        website: 'https://uniswap.org',
        category: 'k/defi',
        avgRating: 4.7,
        reviewCount: 312,
        totalStaked: '120000000000000000000000',
        currentRank: 4,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xdefi0005' },
      update: {},
      create: {
        address: '0xdefi0005',
        name: 'Pendle',
        description: 'Yield tokenization protocol',
        website: 'https://pendle.finance',
        category: 'k/defi',
        avgRating: 4.2,
        reviewCount: 67,
        totalStaked: '28000000000000000000000',
        currentRank: 5,
      },
    }),
  ])
  console.log(`✅ Created ${defiProjects.length} DeFi projects`)

  // Create restaurant projects (Maat integration)
  const restaurantProjects = await Promise.all([
    prisma.project.upsert({
      where: { address: '0xrest0001' },
      update: {},
      create: {
        address: '0xrest0001',
        name: 'Din Tai Fung',
        description: 'Michelin-starred Taiwanese restaurant',
        website: 'https://dintaifung.com',
        category: 'k/restaurants',
        avgRating: 4.8,
        reviewCount: 1024,
        totalStaked: '15000000000000000000000',
        currentRank: 1,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xrest0002' },
      update: {},
      create: {
        address: '0xrest0002',
        name: 'Haidilao',
        description: 'Famous Chinese hot pot chain',
        website: 'https://haidilao.com',
        category: 'k/restaurants',
        avgRating: 4.3,
        reviewCount: 856,
        totalStaked: '12000000000000000000000',
        currentRank: 2,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xrest0003' },
      update: {},
      create: {
        address: '0xrest0003',
        name: 'Ichiran Ramen',
        description: 'Japanese tonkotsu ramen specialist',
        website: 'https://ichiran.com',
        category: 'k/restaurants',
        avgRating: 4.5,
        reviewCount: 512,
        totalStaked: '8000000000000000000000',
        currentRank: 3,
      },
    }),
  ])
  console.log(`✅ Created ${restaurantProjects.length} restaurant projects`)

  // Create reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        reviewerId: users[0].id,
        projectId: defiProjects[0].id,
        rating: 5,
        content: 'Best perp DEX experience. Order book is smooth, fees are low, and the team ships fast. 10x leverage works great.',
        predictedRank: 1,
        stakeAmount: '1000000000000000000000',
        upvotes: 45,
        downvotes: 2,
      },
    }),
    prisma.review.create({
      data: {
        reviewerId: users[1].id,
        projectId: defiProjects[1].id,
        rating: 4,
        content: 'Solid lending protocol. Been using it for 2 years. The v3 multi-chain expansion is great but gas on mainnet still hurts.',
        predictedRank: 2,
        stakeAmount: '500000000000000000000',
        upvotes: 32,
        downvotes: 5,
      },
    }),
    prisma.review.create({
      data: {
        reviewerId: users[2].id,
        projectId: restaurantProjects[0].id,
        rating: 5,
        content: 'The xiaolongbao is absolutely amazing! Waited 45 mins but totally worth it. Pro tip: go during weekday lunch.',
        predictedRank: 1,
        stakeAmount: '200000000000000000000',
        upvotes: 89,
        downvotes: 3,
      },
    }),
    prisma.review.create({
      data: {
        reviewerId: users[0].id,
        projectId: restaurantProjects[1].id,
        rating: 4,
        content: 'Great service and endless ingredients. The robot delivery is cool but sometimes slow. Broth is on point.',
        predictedRank: 2,
        stakeAmount: '150000000000000000000',
        upvotes: 56,
        downvotes: 8,
      },
    }),
  ])
  console.log(`✅ Created ${reviews.length} reviews`)

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
