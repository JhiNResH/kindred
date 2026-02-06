import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeProject } from '@/app/actions/analyze'

export const dynamic = 'force-dynamic'

// POST /api/admin/refresh-cache?project=aave
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project')
  
  if (!project) {
    return NextResponse.json({ error: 'Missing project parameter' }, { status: 400 })
  }
  
  try {
    console.log(`[Admin] Refreshing cache for "${project}"...`)
    
    // Delete old cache
    await prisma.projectAnalysisCache.delete({
      where: { query: project.toLowerCase() }
    }).catch(() => console.log('[Admin] No existing cache'))
    
    // Re-analyze with new prompt (includes funding)
    console.log('[Admin] Running Ma\'at analysis...')
    const result = await analyzeProject(project)
    
    return NextResponse.json({
      success: true,
      project,
      hasFunding: !!result.funding,
      hasInvestors: result.investors?.length || 0,
      hasAudits: result.audits?.length || 0,
      funding: result.funding || null,
    })
  } catch (error: any) {
    console.error('[Admin] Refresh failed:', error)
    return NextResponse.json({
      error: 'Failed to refresh cache',
      message: error.message,
    }, { status: 500 })
  }
}
