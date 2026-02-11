/**
 * Seed Opinion Market Rankings
 * 
 * Based on Feb 2026 market data:
 * - Top 10 Memecoins by market cap (CryptoNews, Feb 9 2026)
 * - Top 5 Perp DEXs by volume
 * - Initial credibility scores from Gemini analysis
 * 
 * Run: npx tsx scripts/seed-opinion-rankings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Next Monday as resolution date
function getNextMonday(): Date {
  const now = new Date();
  const daysUntilMonday = ((1 - now.getDay()) + 7) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(23, 59, 59, 0);
  return nextMonday;
}

async function main() {
  console.log('🎯 Seeding Opinion Market Rankings...\n');

  const resolvesAt = getNextMonday();
  console.log(`📅 Resolution date: ${resolvesAt.toISOString()}\n`);

  // ============================================
  // 1. Memecoin Credibility Rankings
  // ============================================
  console.log('💎 Creating Memecoin Credibility Ranking...');
  
  const memecoinRanking = await prisma.opinionRanking.upsert({
    where: { id: 'memecoin-credibility-w07' },
    update: {},
    create: {
      id: 'memecoin-credibility-w07',
      category: 'memecoin-credibility',
      title: 'Top 10 Memecoin Teams by Credibility (Week 7)',
      description: 'Rank the most credible memecoin teams. Stake DRONE to vote on which teams are trustworthy vs potential rug-pulls.',
      resolvesAt,
      isActive: true,
    },
  });

  // Feb 2026 Top 10 Memecoins by market cap (source: CryptoNews Feb 9 2026)
  const memecoins = [
    { itemId: 'DOGE', name: 'Dogecoin', chain: 'multi', logoUrl: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png', initialScore: 88 },
    { itemId: 'SHIB', name: 'Shiba Inu', chain: 'ethereum', logoUrl: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png', initialScore: 82 },
    { itemId: 'MEMECORE', name: 'MemeCore', chain: 'base', logoUrl: null, initialScore: 68 },
    { itemId: 'PEPE', name: 'Pepe', chain: 'ethereum', logoUrl: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg', initialScore: 79 },
    { itemId: 'TRUMP', name: 'Official Trump', chain: 'solana', logoUrl: null, initialScore: 55 },
    { itemId: 'BONK', name: 'Bonk', chain: 'solana', logoUrl: 'https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg', initialScore: 75 },
    { itemId: 'PENGU', name: 'Pudgy Penguins', chain: 'solana', logoUrl: null, initialScore: 72 },
    { itemId: 'FLOKI', name: 'Floki', chain: 'ethereum', logoUrl: 'https://assets.coingecko.com/coins/images/16746/standard/PNG_image.png', initialScore: 70 },
    { itemId: 'SPX', name: 'SPX6900', chain: 'ethereum', logoUrl: null, initialScore: 60 },
    { itemId: 'WIF', name: 'dogwifhat', chain: 'solana', logoUrl: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg', initialScore: 73 },
  ];

  for (let i = 0; i < memecoins.length; i++) {
    const coin = memecoins[i];
    await prisma.opinionItem.upsert({
      where: {
        rankingId_itemId: { rankingId: memecoinRanking.id, itemId: coin.itemId },
      },
      update: {
        name: coin.name,
        chain: coin.chain,
        logoUrl: coin.logoUrl,
        currentScore: coin.initialScore,
        currentRank: i + 1,
      },
      create: {
        rankingId: memecoinRanking.id,
        itemId: coin.itemId,
        name: coin.name,
        chain: coin.chain,
        logoUrl: coin.logoUrl,
        currentScore: coin.initialScore,
        currentRank: i + 1,
      },
    });
    console.log(`  ✅ ${coin.itemId} (${coin.name}) — Score: ${coin.initialScore}`);
  }

  // ============================================
  // 2. Perp DEX Risk Rankings
  // ============================================
  console.log('\n📊 Creating Perp DEX Risk Ranking...');

  const perpRanking = await prisma.opinionRanking.upsert({
    where: { id: 'perp-risk-w07' },
    update: {},
    create: {
      id: 'perp-risk-w07',
      category: 'perp-risk',
      title: 'Most Reliable Perpetual DEX Platforms (Week 7)',
      description: 'Rank perpetual DEX platforms by reliability, oracle integrity, and liquidation risk. High score = most trustworthy.',
      resolvesAt,
      isActive: true,
    },
  });

  const perpDexes = [
    { itemId: 'HYPERLIQUID', name: 'Hyperliquid', chain: 'hyperliquid', logoUrl: 'https://assets.coingecko.com/coins/images/30127/standard/hyperliquid-hype-logo.png', initialScore: 94 },
    { itemId: 'DYDX', name: 'dYdX', chain: 'cosmos', logoUrl: 'https://assets.coingecko.com/coins/images/17500/standard/hjnIm9bV.jpg', initialScore: 91 },
    { itemId: 'GMX', name: 'GMX', chain: 'arbitrum', logoUrl: 'https://assets.coingecko.com/coins/images/18323/standard/arbit.png', initialScore: 87 },
    { itemId: 'DRIFT', name: 'Drift Protocol', chain: 'solana', logoUrl: 'https://assets.coingecko.com/coins/images/27103/standard/drift_protocol.png', initialScore: 86 },
    { itemId: 'VERTEX', name: 'Vertex', chain: 'arbitrum', logoUrl: null, initialScore: 82 },
    { itemId: 'LIGHTER', name: 'Lighter', chain: 'base', logoUrl: null, initialScore: 78 },
    { itemId: 'ASTER', name: 'Aster', chain: 'base', logoUrl: null, initialScore: 75 },
  ];

  for (let i = 0; i < perpDexes.length; i++) {
    const dex = perpDexes[i];
    await prisma.opinionItem.upsert({
      where: {
        rankingId_itemId: { rankingId: perpRanking.id, itemId: dex.itemId },
      },
      update: {
        name: dex.name,
        chain: dex.chain,
        logoUrl: dex.logoUrl,
        currentScore: dex.initialScore,
        currentRank: i + 1,
      },
      create: {
        rankingId: perpRanking.id,
        itemId: dex.itemId,
        name: dex.name,
        chain: dex.chain,
        logoUrl: dex.logoUrl,
        currentScore: dex.initialScore,
        currentRank: i + 1,
      },
    });
    console.log(`  ✅ ${dex.itemId} (${dex.name}) — Score: ${dex.initialScore}`);
  }

  // ============================================
  // 3. Agent Expert Rankings
  // ============================================
  console.log('\n🤖 Creating Agent Expert Ranking...');

  const agentRanking = await prisma.opinionRanking.upsert({
    where: { id: 'agent-experts-w07' },
    update: {},
    create: {
      id: 'agent-experts-w07',
      category: 'agent-experts',
      title: 'Best Crypto Expert Agents (Week 7)',
      description: 'Rank AI agents by their prediction accuracy and signal quality. Which agents give the best trading signals?',
      resolvesAt,
      isActive: true,
    },
  });

  const agents = [
    { itemId: 'agent-alpha', name: 'Agent Alpha (Memecoin Specialist)', chain: 'solana', initialScore: 85 },
    { itemId: 'agent-beta', name: 'Agent Beta (DeFi Safety)', chain: 'base', initialScore: 80 },
    { itemId: 'agent-gamma', name: 'Agent Gamma (Perp Trader)', chain: 'arbitrum', initialScore: 76 },
  ];

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    await prisma.opinionItem.upsert({
      where: {
        rankingId_itemId: { rankingId: agentRanking.id, itemId: agent.itemId },
      },
      update: {
        name: agent.name,
        chain: agent.chain,
        currentScore: agent.initialScore,
        currentRank: i + 1,
      },
      create: {
        rankingId: agentRanking.id,
        itemId: agent.itemId,
        name: agent.name,
        chain: agent.chain,
        currentScore: agent.initialScore,
        currentRank: i + 1,
      },
    });
    console.log(`  ✅ ${agent.itemId} (${agent.name}) — Score: ${agent.initialScore}`);
  }

  // ============================================
  // Summary
  // ============================================
  const totalItems = memecoins.length + perpDexes.length + agents.length;
  console.log(`\n🎉 Seeding complete!`);
  console.log(`   📋 3 ranking categories created`);
  console.log(`   📊 ${totalItems} items seeded`);
  console.log(`   📅 Resolution: ${resolvesAt.toISOString()}`);
  console.log(`\n🚀 Opinion Market is ready!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
