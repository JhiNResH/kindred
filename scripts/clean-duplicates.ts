/**
 * Clean duplicate projects from database
 * Keep the first entry for each project name
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDuplicates() {
  console.log('🔍 Finding duplicate projects...')
  
  // Find projects with duplicate names
  const allProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' }, // Keep oldest
  })
  
  const seen = new Set<string>()
  const toDelete: string[] = []
  
  for (const project of allProjects) {
    const key = project.name.toLowerCase() // Same name = duplicate
    if (seen.has(key)) {
      console.log(`  ❌ Duplicate: ${project.name} (${project.category}) - ${project.address} - ${project.id}`)
      toDelete.push(project.id)
    } else {
      console.log(`  ✅ Keep: ${project.name} (${project.category}) - ${project.address} - ${project.id}`)
      seen.add(key)
    }
  }
  
  if (toDelete.length === 0) {
    console.log('\n✨ No duplicates found!')
    return
  }
  
  console.log(`\n🗑️  Deleting ${toDelete.length} duplicate(s)...`)
  
  // Delete reviews first (foreign key constraint)
  const deletedReviews = await prisma.review.deleteMany({
    where: { projectId: { in: toDelete } },
  })
  console.log(`  ✅ Deleted ${deletedReviews.count} review(s)`)
  
  // Delete projects
  const deletedProjects = await prisma.project.deleteMany({
    where: { id: { in: toDelete } },
  })
  console.log(`  ✅ Deleted ${deletedProjects.count} project(s)`)
  
  console.log('\n✨ Cleanup complete!')
}

cleanDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
