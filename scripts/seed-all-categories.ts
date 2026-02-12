import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PROJECTS = [
  // === k/ai-agents (Virtuals & AI Agent Tokens) ===
  { name: 'VIRTUAL', address: '0x44ff8620b8ca30902395a7bd3f2407e1a091bf73', category: 'k/ai-agents', description: 'AI agent launchpad on Base. Create, deploy, and monetize AI agents with tokenized ownership.', image: 'https://assets.coingecko.com/coins/images/36271/standard/virtual.png', chain: 'base' },
  { name: 'AIXBT', address: '0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825', category: 'k/ai-agents', description: 'AI-powered crypto intelligence agent on Virtuals. Tracks market sentiment and alpha.', image: 'https://assets.coingecko.com/coins/images/44950/standard/aixbt.png', chain: 'base' },
  { name: 'GAME', address: '0x1C4CcE173c66D5f2D08fa2637cFEA21E8b1F3998', category: 'k/ai-agents', description: 'Game framework for autonomous AI agents on Virtuals. Agents play, trade, and interact.', image: 'https://assets.coingecko.com/coins/images/44951/standard/game.png', chain: 'base' },
  { name: 'LUNA (Virtuals)', address: '0x55cd6469F597452B5A7536e2CD98fDE4c1247ee4', category: 'k/ai-agents', description: 'AI companion agent on Virtuals. Social interaction and community engagement.', image: 'https://assets.coingecko.com/coins/images/44952/standard/luna.png', chain: 'base' },
  { name: 'AI16Z', address: '0xAI16Z000000000000000000000000000000000001', category: 'k/ai-agents', description: 'Decentralized AI VC fund. AI agents manage investment decisions and portfolio allocation.', image: 'https://assets.coingecko.com/coins/images/44893/standard/ai16z.png', chain: 'solana' },
  { name: 'FARTCOIN', address: '0xFART0000000000000000000000000000000000001', category: 'k/ai-agents', description: 'Viral AI agent token. Community-driven AI agent with meme appeal.', image: 'https://assets.coingecko.com/coins/images/44960/standard/fartcoin.png', chain: 'solana' },
  { name: 'GRIFFAIN', address: '0xGRIF0000000000000000000000000000000000001', category: 'k/ai-agents', description: 'AI agent for DeFi portfolio management and automated trading strategies.', image: null, chain: 'solana' },

  // === k/memecoin (Multi-chain Memecoins) ===
  { name: 'DOGE', address: '0xba2ae424d960c26247dd6c32edc70b295c744c43', category: 'k/memecoin', description: 'The OG memecoin. Community-driven, Elon-backed, payment integration growing.', image: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png', chain: 'multi' },
  { name: 'SHIB', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', category: 'k/memecoin', description: 'Shiba Inu ecosystem with ShibaSwap, Shibarium L2, and metaverse.', image: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png', chain: 'ethereum' },
  { name: 'PEPE', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', category: 'k/memecoin', description: 'Frog-themed memecoin. Pure meme, no utility, massive community.', image: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.png', chain: 'ethereum' },
  { name: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', category: 'k/memecoin', description: 'Solana dog memecoin. Airdropped to community, integrated across Solana DeFi.', image: 'https://assets.coingecko.com/coins/images/28600/standard/bonk.png', chain: 'solana' },
  { name: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', category: 'k/memecoin', description: 'Dogwifhat. Solana memecoin with viral hat meme. Top Solana meme by market cap.', image: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.png', chain: 'solana' },
  { name: 'FLOKI', address: '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e', category: 'k/memecoin', description: 'Viking dog memecoin with utility: FlokiFi, Valhalla game, education platform.', image: 'https://assets.coingecko.com/coins/images/16746/standard/FLOKI.png', chain: 'bnb' },
  { name: 'TRUMP', address: '0x576e2bed8f7b46d34aa9e8b6f4a65e0c91b9cb39', category: 'k/memecoin', description: 'Political memecoin riding Trump narrative. Highly speculative, news-driven.', image: 'https://assets.coingecko.com/coins/images/34857/standard/trump.png', chain: 'solana' },
  { name: 'SPX6900', address: '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', category: 'k/memecoin', description: 'SPX parody memecoin. "Flipping the S&P 500" meme narrative.', image: 'https://assets.coingecko.com/coins/images/31401/standard/spx.png', chain: 'ethereum' },
  { name: 'POPCAT', address: 'PopcatXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX001', category: 'k/memecoin', description: 'Cat memecoin on Solana. Viral pop cat meme, strong community.', image: 'https://assets.coingecko.com/coins/images/34249/standard/popcat.png', chain: 'solana' },
  { name: 'MEW', address: 'MEW1111111111111111111111111111111111111111', category: 'k/memecoin', description: 'Cat vs dog memecoin war on Solana. Cat-themed with growing community.', image: 'https://assets.coingecko.com/coins/images/36440/standard/mew.png', chain: 'solana' },

  // === k/bnb-meme (BNB Chain Memecoins) ===
  { name: 'BAKE', address: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5', category: 'k/bnb-meme', description: 'BakerySwap token. AMM + NFT marketplace on BNB Chain.', image: 'https://assets.coingecko.com/coins/images/12588/standard/bakerytoken.png', chain: 'bnb' },
  { name: 'BABYDOGE', address: '0xc748673057861a797275cd8a068abb95a902e8de', category: 'k/bnb-meme', description: 'Baby Doge Coin on BNB Chain. Hyper-deflationary with auto-redistribution.', image: 'https://assets.coingecko.com/coins/images/16125/standard/babydoge.png', chain: 'bnb' },
  { name: 'CAKE', address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', category: 'k/bnb-meme', description: 'PancakeSwap token. Largest DEX on BNB Chain with farms, lottery, predictions.', image: 'https://assets.coingecko.com/coins/images/12632/standard/pancakeswap.png', chain: 'bnb' },
  { name: 'TWT', address: '0x4b0f1812e5df2a09796481ff14017e6005508003', category: 'k/bnb-meme', description: 'Trust Wallet token. Governance for the most popular mobile crypto wallet.', image: 'https://assets.coingecko.com/coins/images/11085/standard/Trust.png', chain: 'bnb' },
  { name: 'BSCPAD', address: '0x5a3010d4d8d3b5fb49f811b1a309f9cb6f96ef36', category: 'k/bnb-meme', description: 'BSCPad launchpad token. Participate in BNB Chain IDOs and token launches.', image: 'https://assets.coingecko.com/coins/images/14627/standard/bscpad.png', chain: 'bnb' },
  { name: 'SIMON\'S CAT', address: '0x2A75d6E0A61F0C977f7c0E0e00D0f2B1fD61a0Ff', category: 'k/bnb-meme', description: 'Simon\'s Cat memecoin on BNB Chain. IP-backed meme with brand recognition.', image: null, chain: 'bnb' },
]

async function main() {
  console.log('🌱 Seeding all categories...\n')

  let created = 0
  let skipped = 0

  for (const project of PROJECTS) {
    try {
      await prisma.project.upsert({
        where: { address: project.address },
        update: {
          name: project.name,
          category: project.category,
          description: project.description,
          image: project.image,
        },
        create: {
          address: project.address,
          name: project.name,
          category: project.category,
          description: project.description,
          image: project.image,
        },
      })
      console.log(`  ✅ ${project.category} | ${project.name} (${project.chain})`)
      created++
    } catch (e: any) {
      console.log(`  ⚠️ Skipped ${project.name}: ${e.message?.slice(0, 80)}`)
      skipped++
    }
  }

  console.log(`\n📊 Results: ${created} upserted, ${skipped} skipped`)
  
  // Print category summary
  const categories = await prisma.project.groupBy({
    by: ['category'],
    _count: { id: true },
  })
  console.log('\n📁 Category Summary:')
  for (const cat of categories) {
    console.log(`  ${cat.category}: ${cat._count.id} projects`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
