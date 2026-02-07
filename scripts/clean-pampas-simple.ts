import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const pampas = await prisma.project.findFirst({
    where: {
      OR: [
        { name: { contains: 'Pampas', mode: 'insensitive' } },
        { address: { contains: 'pampas', mode: 'insensitive' } },
      ],
    },
  })
  
  if (!pampas) {
    console.log('Pampas Grill not found.')
    return
  }
  
  console.log('Found:', pampas.name)
  console.log('Deleting...')
  
  await prisma.project.delete({
    where: { id: pampas.id },
  })
  
  console.log('✓ Deleted!')
}

main().finally(() => prisma.$disconnect())
