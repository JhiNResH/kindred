const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, category: true },
    orderBy: { name: 'asc' }
  });

  console.log(`Total projects: ${projects.length}\n`);
  projects.forEach(p => {
    console.log(`${p.name.padEnd(30)} [${p.category}]`);
  });

  await prisma.$disconnect();
}

list().catch(console.error);
