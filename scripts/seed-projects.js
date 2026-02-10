const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PROJECTS = [
  { name: 'Uniswap V4', address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', category: 'k/defi', description: 'Decentralized AMM with hooks' },
  { name: 'Aave V3', address: '0x7fc66500c84a76ad7e9c93437e434122a1649a15', category: 'k/defi', description: 'Lending protocol' },
  { name: 'Curve Finance', address: '0xd533a949740bb3306d119cc777fa900ba034cd52', category: 'k/defi', description: 'Stablecoin DEX' },
  { name: 'Hyperliquid', address: '0x1', category: 'k/perp-dex', description: 'Perpetual DEX' },
  { name: 'Drift Protocol', address: '0x2', category: 'k/perp-dex', description: 'Solana perp DEX' },
  { name: 'Jupiter', address: '0x3', category: 'k/ai', description: 'AI routing protocol' },
];

async function seed() {
  console.log('Seeding projects...\n');

  for (const p of PROJECTS) {
    try {
      const existing = await prisma.project.findUnique({
        where: { address: p.address }
      });

      if (existing) {
        console.log(`✓ Already exists: ${p.name}`);
      } else {
        await prisma.project.create({
          data: {
            name: p.name,
            address: p.address,
            category: p.category,
            description: p.description,
          }
        });
        console.log(`✅ Created: ${p.name}`);
      }
    } catch (e) {
      console.error(`❌ Error: ${p.name}:`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('\n✨ Seeding complete');
}

seed().catch(console.error);
