/**
 * Clean up Pampas Grill restaurant data
 * Remove old project entry so it can be re-analyzed with restaurant-specific logic
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Searching for Pampas Grill...')
  
  const pampas = await prisma.project.findFirst({
    where: {
      OR: [
        { name: { contains: 'Pampas', mode: 'insensitive' } },
        { address: { contains: 'pampas', mode: 'insensitive' } },
      ],
    },
    include: {
      reviews: true,
      analysisCache: true,
    },
  })
  
  if (!pampas) {
    console.log('Pampas Grill not found in database.')
    return
  }
  
  console.log('Found:', pampas.name, `(${pampas.address})`)
  console.log('Category:', pampas.category)
  console.log('Description:', pampas.description?.substring(0, 100))
  console.log('Reviews:', pampas.reviews.length)
  console.log('Has analysis cache:', !!pampas.analysisCache)
  
  // Delete analysis cache first
  if (pampas.analysisCache) {
    await prisma.projectAnalysisCache.delete({
      where: { projectId: pampas.id },
    })
    console.log('✓ Deleted analysis cache')
  }
  
  // Delete project (reviews will cascade delete)
  await prisma.project.delete({
    where: { id: pampas.id },
  })
  
  console.log('✓ Deleted project')
  console.log('\nPampas Grill cleaned! Now search again to trigger re-analysis.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
