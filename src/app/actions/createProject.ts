'use server'

import { prisma } from "@/lib/prisma"
import { analyzeProject, Web3ProjectResult } from "./analyze"

// Map Gemini type to our category format
function mapTypeToCategory(type: string): string {
  const typeMap: Record<string, string> = {
    'DEX': 'k/perp-dex',
    'DeFi': 'k/defi',
    'NFT': 'k/nft',
    'AI': 'k/ai',
    'Meme': 'k/memecoin',
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
    console.log(`[Kindred] Project "${query}" not found, running Ma'at analysis...`)
    const analysis = await analyzeProject(query)
    
    // 3. Create project in database
    const address = generateProjectAddress(analysis.name || query)
    const category = mapTypeToCategory(analysis.type)
    
    const newProject = await prisma.project.create({
      data: {
        address,
        name: analysis.name || query,
        description: analysis.summary,
        category,
        website: analysis.website,
        avgRating: analysis.score,
        reviewCount: 0,
        totalStaked: '0',
        currentRank: null,
      }
    })
    
    console.log(`[Kindred] Created new project: ${newProject.name} (${newProject.id})`)
    
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
    console.error('[Kindred] findOrCreateProject error:', error)
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
    console.error('[Kindred] getProjectWithAnalysis error:', error)
    return null
  }
}
