import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDuplicates() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, address: true, category: true },
    orderBy: { name: 'asc' },
  })
  
  console.log(`Total projects: ${projects.length}\n`)
  
  const byName = new Map<string, typeof projects>()
  
  for (const project of projects) {
    const key = project.name.toLowerCase()
    if (!byName.has(key)) {
      byName.set(key, [])
    }
    byName.get(key)!.push(project)
  }
  
  const duplicates = Array.from(byName.entries()).filter(([_, ps]) => ps.length > 1)
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!')
    return
  }
  
  console.log(`⚠️  Found ${duplicates.length} duplicate project name(s):\n`)
  for (const [name, ps] of duplicates) {
    console.log(`📦 ${name}:`)
    for (const p of ps) {
      console.log(`   - ${p.id} | ${p.address} | ${p.category}`)
    }
    console.log()
  }
}

checkDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
