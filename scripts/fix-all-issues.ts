/**
 * Fix all data issues:
 * 1. Delete corrupted entries (cml...)
 * 2. Fix Lighter category to k/perp-dex
 * 3. Add CoinGecko logos to projects missing images
 * 4. Fix Polymarket, Curve, Puffer Finance logos
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CoinGecko ID mapping for known projects
const COINGECKO_IDS: Record<string, string> = {
  'aave': 'aave',
  'uniswap': 'uniswap',
  'curve': 'curve-dao-token',
  'curve finance': 'curve-dao-token',
  'puffer finance': 'puffer-finance',
  'puffer': 'puffer-finance',
  'ether.fi': 'ether-fi',
  'etherfi': 'ether-fi',
  'eigenlayer': 'eigenlayer',
  'hyperliquid': 'hyperliquid',
  'lighter': 'lighter',
  'solayer': 'solayer',
  'polymarket': 'polymarket', // May not have CoinGecko, use fallback
  'kindred': null, // Our own project
}

// Fallback logos for projects not on CoinGecko
const FALLBACK_LOGOS: Record<string, string> = {
  'polymarket': 'https://polymarket.com/icons/apple-touch-icon.png',
  'kindred': 'https://kindred.app/logo.png',
}

async function getCoinGeckoLogo(coinId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`)
    if (!res.ok) return null
    const data = await res.json()
    return data.image?.large || data.image?.small || null
  } catch {
    return null
  }
}

async function main() {
  console.log('🔧 Starting data fixes...\n')

  // 1. Delete corrupted entries
  console.log('1️⃣ Deleting corrupted entries...')
  const deleted = await prisma.project.deleteMany({
    where: {
      OR: [
        { name: { startsWith: 'cml' } },
        { address: { startsWith: 'cml' } },
        { name: { contains: '系統無法確認' } },
      ]
    }
  })
  console.log(`   Deleted ${deleted.count} corrupted entries\n`)

  // 2. Fix Lighter category
  console.log('2️⃣ Fixing Lighter category to k/perp-dex...')
  const lighterFix = await prisma.project.updateMany({
    where: { name: { equals: 'Lighter', mode: 'insensitive' } },
    data: { category: 'k/perp-dex' }
  })
  console.log(`   Updated ${lighterFix.count} Lighter entries\n`)

  // 3. Fix missing logos
  console.log('3️⃣ Fixing missing logos...')
  const projectsWithoutLogos = await prisma.project.findMany({
    where: { 
      OR: [
        { image: null },
        { image: '' },
      ]
    }
  })
  
  console.log(`   Found ${projectsWithoutLogos.length} projects without logos`)
  
  for (const project of projectsWithoutLogos) {
    const nameLower = project.name.toLowerCase()
    const coinId = COINGECKO_IDS[nameLower]
    
    let logoUrl: string | null = null
    
    // Try CoinGecko first
    if (coinId) {
      console.log(`   Fetching CoinGecko logo for ${project.name}...`)
      logoUrl = await getCoinGeckoLogo(coinId)
    }
    
    // Fallback to hardcoded
    if (!logoUrl && FALLBACK_LOGOS[nameLower]) {
      logoUrl = FALLBACK_LOGOS[nameLower]
    }
    
    if (logoUrl) {
      await prisma.project.update({
        where: { id: project.id },
        data: { image: logoUrl }
      })
      console.log(`   ✅ ${project.name}: ${logoUrl.substring(0, 50)}...`)
    } else {
      console.log(`   ⚠️ ${project.name}: No logo found`)
    }
  }

  // 4. Also update projects that have logos but might need better ones
  console.log('\n4️⃣ Updating known project logos...')
  const knownProjects = ['Aave', 'Uniswap', 'Curve Finance', 'Puffer Finance', 'ether.fi', 'EigenLayer', 'Hyperliquid', 'Lighter', 'Solayer']
  
  for (const projectName of knownProjects) {
    const nameLower = projectName.toLowerCase()
    const coinId = COINGECKO_IDS[nameLower]
    
    if (!coinId) continue
    
    const logoUrl = await getCoinGeckoLogo(coinId)
    if (logoUrl) {
      const result = await prisma.project.updateMany({
        where: { name: { equals: projectName, mode: 'insensitive' } },
        data: { image: logoUrl }
      })
      if (result.count > 0) {
        console.log(`   ✅ ${projectName}: Updated logo`)
      }
    }
    
    // Rate limit CoinGecko
    await new Promise(r => setTimeout(r, 500))
  }

  // 5. Final summary
  console.log('\n📊 Final state:')
  const allProjects = await prisma.project.findMany({
    select: { name: true, category: true, image: true }
  })
  
  for (const p of allProjects) {
    const hasLogo = p.image ? '✅' : '❌'
    console.log(`   ${hasLogo} ${p.name} (${p.category})`)
  }
  
  console.log('\n✨ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
