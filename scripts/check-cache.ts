import { prisma } from '../src/lib/prisma'

async function main() {
  const query = process.argv[2] || 'aave'
  
  const cache = await prisma.projectAnalysisCache.findUnique({
    where: { query: query.toLowerCase() }
  })
  
  if (!cache) {
    console.log(`❌ No cache found for "${query}"`)
    return
  }
  
  const analysis = JSON.parse(cache.result)
  console.log(`✅ Cache found for "${query}"`)
  console.log('Has funding:', !!analysis.funding)
  console.log('Has investors:', analysis.investors?.length || 0)
  console.log('Has audits:', analysis.audits?.length || 0)
  console.log('Has features:', analysis.features?.length || 0)
  console.log('Has warnings:', analysis.warnings?.length || 0)
  
  if (analysis.funding) {
    console.log('\n💰 Funding data:')
    console.log(JSON.stringify(analysis.funding, null, 2))
  } else {
    console.log('\n⚠️ No funding data in cache - need to refresh')
  }
}

main().finally(() => prisma.$disconnect())
