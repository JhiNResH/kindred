import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo restaurant reviews...\n')
  
  // 1. Delete Uniswap Café (wrong data)
  console.log('❌ Deleting Uniswap Café...')
  await prisma.project.deleteMany({
    where: {
      name: { contains: 'Uniswap', mode: 'insensitive' },
      category: 'k/gourmet',
    },
  })
  
  // 2. Get or create demo user
  let demoUser = await prisma.user.findUnique({
    where: { address: '0xdemo1234567890abcdef' },
  })
  
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        address: '0xdemo1234567890abcdef',
        displayName: 'Demo Reviewer',
        reputationScore: 100,
      },
    })
  }
  
  // 3. Add reviews to demo restaurants
  const restaurants = [
    {
      slug: 'din-tai-fung',
      name: '鼎泰豐 Din Tai Fung',
      reviews: [
        { rating: 5, content: 'Best xiaolongbao in town! The soup dumplings are perfectly crafted with 18 folds.' },
        { rating: 4, content: 'Great food but can get crowded during lunch hours. Worth the wait!' },
        { rating: 5, content: 'Must try: Pork & Crab Xiao Long Bao. The service is excellent and efficient.' },
      ],
    },
    {
      slug: 'ichiran-ramen',
      name: '一蘭拉麵 Ichiran',
      reviews: [
        { rating: 5, content: 'Unique solo dining experience. The tonkotsu broth is rich and flavorful!' },
        { rating: 4, content: 'Love the customizable options. A bit pricey but worth it for ramen lovers.' },
      ],
    },
    {
      slug: 'shake-shack',
      name: 'Shake Shack',
      reviews: [
        { rating: 4, content: 'Better than typical fast food. The ShackBurger is juicy and delicious!' },
        { rating: 5, content: 'Amazing shakes and crinkle fries. The concrete is a must-try dessert.' },
        { rating: 3, content: 'Good burgers but a bit overpriced for fast food. Long lines during peak hours.' },
      ],
    },
  ]
  
  for (const rest of restaurants) {
    const project = await prisma.project.findFirst({
      where: { address: rest.slug, category: 'k/gourmet' },
    })
    
    if (!project) {
      console.log(`⚠️  ${rest.name} not found, skipping...`)
      continue
    }
    
    console.log(`\n✅ Adding ${rest.reviews.length} reviews to ${rest.name}`)
    
    for (const review of rest.reviews) {
      await prisma.review.create({
        data: {
          reviewerId: demoUser.id,
          projectId: project.id,
          rating: review.rating,
          content: review.content,
          stakeAmount: '1000000000000000000', // 1 OPEN
          predictedRank: null,
          photoUrls: '[]',
        },
      })
    }
    
    // Update project stats
    const reviews = await prisma.review.findMany({
      where: { projectId: project.id },
    })
    
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    const totalStaked = reviews.reduce((acc, r) => BigInt(r.stakeAmount), BigInt(0))
    
    await prisma.project.update({
      where: { id: project.id },
      data: {
        reviewCount: reviews.length,
        avgRating,
        totalStaked: totalStaked.toString(),
      },
    })
    
    console.log(`   Updated: ${reviews.length} reviews, ${avgRating.toFixed(1)}★`)
  }
  
  console.log('\n✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
