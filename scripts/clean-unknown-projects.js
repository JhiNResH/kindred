const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanUnknown() {
  console.log('Searching for unidentifiable projects...\n');

  // Get all projects
  const allProjects = await prisma.project.findMany({
    include: {
      reviews: { select: { id: true } },
    }
  });

  // Define known/legitimate projects
  const KNOWN_PROJECTS = new Set([
    'uniswap', 'aave', 'curve', 'solend', 'marinade', 'lido',
    'jupiter', 'raydium', 'phantom', 'magic eden', 'opensea',
    'dydx', 'hyperliquid', 'drift', 'perp', 'margin',
    'arbitrum', 'optimism', 'polygon', 'base', 'solana',
    'ethereum', 'bitcoin', 'starknet', 'zksync', 'scroll',
  ]);

  const toDelete = [];

  for (const p of allProjects) {
    const nameNorm = p.name.toLowerCase().trim();
    const isKnown = Array.from(KNOWN_PROJECTS).some(k => nameNorm.includes(k));
    const hasReviews = p.reviews.length > 0;
    const isSuspicious = 
      nameNorm.length < 3 || 
      nameNorm.includes('%') ||
      /^[a-z0-9]{20,}$/.test(nameNorm) || // Random hash
      nameNorm === 'unknown' ||
      nameNorm === 'test' ||
      nameNorm === 'demo';

    if (!hasReviews && (isSuspicious || !isKnown)) {
      toDelete.push(p);
      console.log(`🗑️  DELETE: "${p.name}" (reviews: ${hasReviews}, known: ${isKnown})`);
    }
  }

  console.log(`\nTotal to delete: ${toDelete.length}\n`);

  for (const p of toDelete) {
    try {
      await prisma.project.delete({ where: { id: p.id } });
      console.log(`✅ Deleted: ${p.name}`);
    } catch (e) {
      console.error(`❌ Error deleting ${p.name}:`, e.message);
    }
  }

  console.log(`\n✨ Cleaned up ${toDelete.length} projects`);
  await prisma.$disconnect();
}

cleanUnknown().catch(console.error);
