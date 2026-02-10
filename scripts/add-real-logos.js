const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CoinGecko CDN URLs - reliable high-quality logos
const LOGO_MAP = {
  'Uniswap V4': 'https://assets.coingecko.com/coins/images/24291/standard/uniswap-uni-logo.png',
  'Aave V3': 'https://assets.coingecko.com/coins/images/12645/standard/aave-coin-logo.png',
  'Curve Finance': 'https://assets.coingecko.com/coins/images/12124/standard/Curve_DAO_logo.png',
  'Hyperliquid': 'https://assets.coingecko.com/coins/images/30127/standard/hyperliquid-hype-logo.png',
  'Drift Protocol': 'https://assets.coingecko.com/coins/images/27103/standard/drift_protocol.png',
  'Jupiter': 'https://assets.coingecko.com/coins/images/27837/standard/jupiter.png',
};

const PROJECT_NAMES = Object.keys(LOGO_MAP);

async function addRealLogos() {
  console.log('🎨 Adding real CoinGecko logos...\n');

  try {
    // Step 1: Query all projects by name
    const projects = await prisma.project.findMany({
      where: {
        name: { in: PROJECT_NAMES }
      },
      select: { id: true, name: true, image: true }
    });

    console.log(`Found ${projects.length} projects to update\n`);

    // Step 2: Update each by ID with correct logo
    let updated = 0;
    for (const project of projects) {
      const newLogo = LOGO_MAP[project.name];
      
      if (!newLogo) {
        console.log(`⚠️  No logo mapping for "${project.name}", skipping`);
        continue;
      }

      // Update by ID (unique)
      await prisma.project.update({
        where: { id: project.id },
        data: { image: newLogo }
      });

      console.log(`✅ ${project.name}`);
      console.log(`   ${newLogo}\n`);
      updated++;
    }

    console.log(`\n✨ Updated ${updated}/${PROJECT_NAMES.length} projects`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addRealLogos();
