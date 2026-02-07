import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cacheKey = 'pampas grill churrascaria'
  
  const cache = await prisma.projectAnalysisCache.findUnique({
    where: { query: cacheKey },
  })
  
  if (!cache) {
    console.log('No cache found for:', cacheKey)
    return
  }
  
  console.log('Deleting cache for:', cacheKey)
  await prisma.projectAnalysisCache.delete({
    where: { query: cacheKey },
  })
  
  console.log('✓ Cache cleared! Refresh page to fetch photos.')
}

main().finally(() => prisma.$disconnect())
