import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const restaurants = await prisma.project.findMany({
    where: {
      category: 'k/gourmet',
    },
    orderBy: {
      reviewCount: 'desc',
    },
    select: {
      id: true,
      name: true,
      address: true,
      reviewCount: true,
      avgRating: true,
      createdAt: true,
    },
  })
  
  console.log('Total k/gourmet restaurants:', restaurants.length)
  console.log('\nAll restaurants:')
  
  restaurants.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name} (${r.address})`)
    console.log(`   Reviews: ${r.reviewCount}, Rating: ${r.avgRating}`)
    console.log(`   Created: ${r.createdAt.toISOString().split('T')[0]}`)
    console.log()
  })
  
  const withReviews = restaurants.filter(r => r.reviewCount > 0)
  console.log(`\nRestaurants with reviews: ${withReviews.length}`)
  console.log(`Restaurants without reviews: ${restaurants.length - withReviews.length}`)
}

main().finally(() => prisma.$disconnect())
