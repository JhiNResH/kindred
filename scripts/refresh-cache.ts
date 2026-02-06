import { config } from 'dotenv'
config({ path: '.env.local' })

import { prisma } from '../src/lib/prisma'
import { analyzeProject } from '../src/app/actions/analyze'

async function main() {
  const query = process.argv[2] || 'aave'
  
  console.log(`🔄 Refreshing cache for "${query}"...`)
  console.log('API Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'Found' : 'Missing')
  
  // Delete old cache
  await prisma.projectAnalysisCache.delete({
    where: { query: query.toLowerCase() }
  }).catch(() => console.log('No existing cache'))
  
  // Re-analyze with new prompt (includes funding)
  console.log('🤖 Running Maat analysis...')
  const result = await analyzeProject(query)
  
  console.log('\n✅ Analysis complete!')
  console.log('Has funding:', !!result.funding)
  console.log('Has investors:', result.investors?.length || 0)
  console.log('Has audits:', result.audits?.length || 0)
  
  if (result.funding) {
    console.log('\n💰 Funding:')
    console.log(JSON.stringify(result.funding, null, 2))
  } else {
    console.log('\n⚠️ No funding data found')
  }
}

main().finally(() => prisma.$disconnect())
