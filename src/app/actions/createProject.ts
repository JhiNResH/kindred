'use server'

import { prisma } from "@/lib/prisma"
import { analyzeProject, Web3ProjectResult } from "./analyze"

// Known perp DEXes (override Gemini's classification)
const KNOWN_PERP_DEXES = [
  'hyperliquid', 'gmx', 'dydx', 'perpetual protocol', 'drift',
  'vertex', 'gains network', 'kwenta', 'level finance', 'mux'
]

// Known prediction markets
const KNOWN_PREDICTION = [
  'polymarket', 'kalshi', 'augur', 'gnosis', 'azuro', 'overtime'
]

// Known infrastructure projects
const KNOWN_INFRA = [
  'eigenlayer', 'celestia', 'layerzero', 'chainlink', 'the graph',
  'circle', 'tether', 'stripe', 'paxos', 'coinbase commerce' // Stablecoin issuers
]

// Known wallet projects
const KNOWN_WALLETS = [
  'phantom', 'metamask', 'ledger', 'trezor', 'safe', 'gnosis', 'argent', 'wallet',
  'rainbow', 'frame', 'coinbase wallet', 'trust wallet', 'exodus', 'myetherwallet'
]

// Known stablecoin projects
const KNOWN_STABLECOINS = [
  'usdc', 'usdt', 'dai', 'frax', 'busd', 'tusd', 'paxg', 'ust', 'tether',
  'stablecoin', 'stable', 'usdx', 'eurc', 'fxusd', 'steth', 'lseth'
]

// Map Gemini type to our category format
function mapTypeToCategory(type: string, projectName?: string): string {
  const nameLower = (projectName || '').toLowerCase()
  
  // Override for known stablecoins (check first - most specific)
  if (KNOWN_STABLECOINS.some(s => nameLower.includes(s))) {
    return 'k/stablecoin'
  }
  
  // Override for known wallets
  if (KNOWN_WALLETS.some(w => nameLower.includes(w))) {
    return 'k/wallet'
  }
  
  // Override for known perp DEXes
  if (KNOWN_PERP_DEXES.some(p => nameLower.includes(p))) {
    return 'k/perp-dex'
  }
  
  // Override for known prediction markets
  if (KNOWN_PREDICTION.some(p => nameLower.includes(p))) {
    return 'k/prediction'
  }
  
  // Override for known infra projects
  if (KNOWN_INFRA.some(p => nameLower.includes(p))) {
    return 'k/infra'
  }

  const typeMap: Record<string, string> = {
    'DEX': 'k/defi',           // Spot DEX like Uniswap → DeFi
    'Perpetual DEX': 'k/perp-dex', // Perp DEX like GMX, Hyperliquid
    'Perp': 'k/perp-dex',
    'Prediction Market': 'k/prediction',
    'Prediction': 'k/prediction',
    'DeFi': 'k/defi',
    'NFT': 'k/nft',
    'AI': 'k/ai',
    'Meme': 'k/memecoin',
    'Memecoin': 'k/memecoin',
    'Infrastructure': 'k/infra',
    'Mobile': 'k/mobile',
    'Other': 'k/defi',
  }
  return typeMap[type] || 'k/defi'
}

// Generate a unique address from project name (for projects without real addresses)
function generateProjectAddress(name: string): string {
  const hash = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const suffix = hash.slice(0, 38).padEnd(38, '0')
  return `0x${suffix}`
}

export interface CreateProjectResult {
  success: boolean
  project?: {
    id: string
    address: string
    name: string
    category: string
    avgRating: number
    description?: string
  }
  analysis?: Web3ProjectResult
  error?: string
  isNew: boolean
}

/**
 * Search for project, analyze with Gemini, and create in DB if not exists
 */
export async function findOrCreateProject(query: string): Promise<CreateProjectResult> {
  const searchTerm = query.toLowerCase().trim()
  
  try {
    // 1. Check if project already exists (by name or address)
    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
        ]
      }
    })
    
    if (existingProject) {
      // Get cached analysis if exists
      const cachedAnalysis = await prisma.projectAnalysisCache.findUnique({
        where: { query: searchTerm }
      })
      
      let analysis: Web3ProjectResult | undefined
      if (cachedAnalysis) {
        analysis = JSON.parse(cachedAnalysis.result)
      }
      
      return {
        success: true,
        project: {
          id: existingProject.id,
          address: existingProject.address,
          name: existingProject.name,
          category: existingProject.category,
          avgRating: existingProject.avgRating,
          description: existingProject.description || undefined,
        },
        analysis,
        isNew: false,
      }
    }
    
    // 2. Project doesn't exist - analyze with Gemini
    console.log(`[Maat] Project "${query}" not found, running Ma'at analysis...`)
    const analysis = await analyzeProject(query)
    
    // 3. Create project in database
    const address = generateProjectAddress(analysis.name || query)
    const category = mapTypeToCategory(analysis.type, analysis.name || query)
    console.log(`[Maat] Analysis type: "${analysis.type}" -> Category: "${category}"`)
    
    const newProject = await prisma.project.create({
      data: {
        address,
        name: analysis.name || query,
        description: analysis.summary,
        image: analysis.image, // Logo from CoinGecko
        category,
        website: analysis.website,
        avgRating: analysis.score,
        reviewCount: 0,
        totalStaked: '0',
        currentRank: null,
        status: 'approved', // Immediately approve new projects
        reviewedBy: 'gemini',
        reviewedAt: new Date(),
      }
    })
    
    console.log(`[Maat] Created new project: ${newProject.name} (${newProject.id})`)
    
    return {
      success: true,
      project: {
        id: newProject.id,
        address: newProject.address,
        name: newProject.name,
        category: newProject.category,
        avgRating: newProject.avgRating,
        description: newProject.description || undefined,
      },
      analysis,
      isNew: true,
    }
    
  } catch (error) {
    console.error('[Maat] findOrCreateProject error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isNew: false,
    }
  }
}

/**
 * Get project with its analysis data
 */
export async function getProjectWithAnalysis(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { reviewer: true }
        }
      }
    })
    
    if (!project) return null
    
    // Try to get cached analysis
    const cached = await prisma.projectAnalysisCache.findFirst({
      where: {
        OR: [
          { query: project.name.toLowerCase() },
          { query: project.address.toLowerCase() },
        ]
      }
    })
    
    let analysis: Web3ProjectResult | null = null
    if (cached) {
      analysis = JSON.parse(cached.result)
    }
    
    return { project, analysis }
  } catch (error) {
    console.error('[Maat] getProjectWithAnalysis error:', error)
    return null
  }
}
