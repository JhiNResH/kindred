import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { address: '0x1234567890123456789012345678901234567890' },
      update: {},
      create: {
        address: '0x1234567890123456789012345678901234567890',
        displayName: 'DeFi Degen',
        reputationScore: 850,
        totalReviews: 42,
        totalUpvotes: 156,
        feeTier: 'elite',
      },
    }),
    prisma.user.upsert({
      where: { address: '0x2345678901234567890123456789012345678901' },
      update: {},
      create: {
        address: '0x2345678901234567890123456789012345678901',
        displayName: 'Whale Watcher',
        reputationScore: 720,
        totalReviews: 28,
        totalUpvotes: 89,
        feeTier: 'trusted',
      },
    }),
    prisma.user.upsert({
      where: { address: '0x3456789012345678901234567890123456789012' },
      update: {},
      create: {
        address: '0x3456789012345678901234567890123456789012',
        displayName: 'Protocol Hunter',
        reputationScore: 450,
        totalReviews: 15,
        totalUpvotes: 34,
        feeTier: 'normal',
      },
    }),
  ])
  console.log(`✅ Created ${users.length} users`)

  // Create DeFi projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
      update: {},
      create: {
        address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        name: 'Uniswap',
        description: 'The largest DEX by volume',
        category: 'k/defi',
        avgRating: 4.5,
        reviewCount: 128,
        totalStaked: '50000000000000000000000',
        currentRank: 1,
      },
    }),
    prisma.project.upsert({
      where: { address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },
      update: {},
      create: {
        address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        name: 'Aave',
        description: 'Decentralized lending protocol',
        category: 'k/defi',
        avgRating: 4.3,
        reviewCount: 95,
        totalStaked: '35000000000000000000000',
        currentRank: 2,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f' },
      update: {},
      create: {
        address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
        name: 'Synthetix',
        description: 'Synthetic assets protocol',
        category: 'k/defi',
        avgRating: 4.0,
        reviewCount: 67,
        totalStaked: '22000000000000000000000',
        currentRank: 3,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
      update: {},
      create: {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        name: 'Hyperliquid',
        description: 'High-performance perp DEX',
        category: 'k/perp-dex',
        avgRating: 4.7,
        reviewCount: 89,
        totalStaked: '45000000000000000000000',
        currentRank: 1,
      },
    }),
    prisma.project.upsert({
      where: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
      update: {},
      create: {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        name: 'GMX',
        description: 'Decentralized perpetual exchange',
        category: 'k/perp-dex',
        avgRating: 4.4,
        reviewCount: 76,
        totalStaked: '28000000000000000000000',
        currentRank: 2,
      },
    }),
    prisma.project.upsert({
      where: { address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
      update: {},
      create: {
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        name: 'PEPE',
        description: 'The most memeable memecoin',
        category: 'k/memecoin',
        avgRating: 3.8,
        reviewCount: 234,
        totalStaked: '15000000000000000000000',
        currentRank: 1,
      },
    }),
  ])
  console.log(`✅ Created ${projects.length} projects`)

  // Create reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        content: 'Uniswap V4 hooks are game-changing. The customizability is insane.',
        predictedRank: 1,
        stakeAmount: '1000000000000000000',
        upvotes: 45,
        reviewerId: users[0].id,
        projectId: projects[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        content: 'Aave V3 has great capital efficiency but UI could be better.',
        predictedRank: 2,
        stakeAmount: '500000000000000000',
        upvotes: 28,
        reviewerId: users[1].id,
        projectId: projects[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        content: 'Hyperliquid is the future of perp trading. Sub-second execution.',
        predictedRank: 1,
        stakeAmount: '2000000000000000000',
        upvotes: 67,
        reviewerId: users[0].id,
        projectId: projects[3].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        content: 'PEPE to the moon 🐸 Community is amazing.',
        predictedRank: 1,
        stakeAmount: '100000000000000000',
        upvotes: 156,
        reviewerId: users[2].id,
        projectId: projects[5].id,
      },
    }),
  ])
  console.log(`✅ Created ${reviews.length} reviews`)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
