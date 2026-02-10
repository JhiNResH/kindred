const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RESTAURANTS = [
  {
    name: 'Ding Tai Fung',
    address: 'ding-tai-fung-sf',
    category: 'k/gourmet',
    description: 'Legendary xiaolongbao and dim sum, 3 Michelin stars',
    image: 'https://lh3.googleusercontent.com/p/AF1QipO8EXAMPLE/w400',
  },
  {
    name: 'Benu',
    address: 'benu-sf',
    category: 'k/gourmet',
    description: '3 Michelin star innovative American cuisine',
    image: 'https://lh3.googleusercontent.com/p/AF1QipO8EXAMPLE/w400',
  },
  {
    name: 'Atelier Crenn',
    address: 'atelier-crenn-sf',
    category: 'k/gourmet',
    description: 'First 3 Michelin star female chef in US',
    image: 'https://lh3.googleusercontent.com/p/AF1QipO8EXAMPLE/w400',
  },
  {
    name: 'Lazy Bear',
    address: 'lazy-bear-sf',
    category: 'k/gourmet',
    description: '2 Michelin star, reservation-only omakase',
    image: 'https://lh3.googleusercontent.com/p/AF1QipO8EXAMPLE/w400',
  },
  {
    name: 'State Bird Provisions',
    address: 'state-bird-sf',
    category: 'k/gourmet',
    description: 'Playful small plates, cart service',
    image: 'https://lh3.googleusercontent.com/p/AF1QipO8EXAMPLE/w400',
  },
  {
    name: 'Quince',
    address: 'quince-sf',
    category: 'k/gourmet',
    description: '3 Michelin star Italian fine dining',
    image: 'https://lh3.googleusercontent.com/p/AF1QipO8EXAMPLE/w400',
  },
];

async function seedRestaurants() {
  console.log('Seeding restaurants...\n');

  for (const r of RESTAURANTS) {
    try {
      const existing = await prisma.project.findUnique({
        where: { address: r.address }
      });

      if (existing) {
        console.log(`✓ Already exists: ${r.name}`);
      } else {
        await prisma.project.create({
          data: {
            name: r.name,
            address: r.address,
            category: r.category,
            description: r.description,
            image: r.image,
          }
        });
        console.log(`✅ Created: ${r.name}`);
      }
    } catch (e) {
      console.error(`❌ Error: ${r.name}:`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('\n✨ Restaurant seeding complete');
}

seedRestaurants().catch(console.error);
