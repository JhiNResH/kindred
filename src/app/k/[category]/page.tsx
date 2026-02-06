import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCategoryMetadata, CATEGORY_META } from '@/lib/seo'
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd'
import { CategoryPageContent } from './CategoryPageContent'

// Static params for pre-rendering
export function generateStaticParams() {
  return [
    { category: 'defi' },
    { category: 'perp-dex' },
    { category: 'prediction' },
    { category: 'memecoin' },
    { category: 'ai' },
    { category: 'infra' },
    { category: 'gourmet' },
    { category: 'all' },
  ]
}

// Dynamic metadata generation for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}): Promise<Metadata> {
  const { category } = await params
  return getCategoryMetadata(category)
}

const CATEGORY_INFO: Record<string, { icon: string; description: string }> = {
  'defi': { icon: '🏦', description: 'DeFi protocols - Lending, DEXs, Yield' },
  'perp-dex': { icon: '📈', description: 'Perpetual DEXs - Derivatives trading' },
  'prediction': { icon: '📊', description: 'Prediction markets - Polymarket, Kalshi' },
  'memecoin': { icon: '🐕', description: 'Memecoins - The degen corner' },
  'ai': { icon: '🤖', description: 'AI projects - ML, Agents, Data' },
  'infra': { icon: '🏗️', description: 'Infrastructure - Wallets, Bridges, Tools' },
  'gourmet': { icon: '🍽️', description: 'Restaurant reviews - Verified dining' },
  'all': { icon: '🌐', description: 'All categories' },
}

// Category-specific FAQs for rich snippets
const CATEGORY_FAQS: Record<string, { question: string; answer: string }[]> = {
  'defi': [
    { 
      question: 'How does Kindred review DeFi protocols?', 
      answer: 'Kindred uses stake-weighted reviews where users must put tokens at risk. This ensures reviewers have skin in the game. Reviews are verified through on-chain transaction history and community voting.' 
    },
    { 
      question: 'Are DeFi reviews on Kindred trustworthy?', 
      answer: 'Yes. Unlike traditional reviews, Kindred reviews require staking tokens. Misleading reviews can result in stake loss, creating strong incentives for honest, accurate assessments.' 
    },
  ],
  'memecoin': [
    { 
      question: 'How can I avoid memecoin rug pulls?', 
      answer: 'Kindred provides community-verified ratings for memecoins. Check the risk score, read staked reviews, and look at the voting history. High-stake reviews from reputable users are more reliable.' 
    },
  ],
  'ai': [
    { 
      question: 'How does Kindred evaluate AI projects?', 
      answer: 'AI projects are reviewed based on technical capability, team background, token utility, and real-world usage. Our Ma\'at AI engine also provides automated analysis of smart contracts and social signals.' 
    },
  ],
}

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = await params
  const info = CATEGORY_INFO[category] || { icon: '📁', description: 'Community reviews' }
  
  // Fetch some stats for the page (server-side)
  let reviewCount = 0
  let projectCount = 0
  
  try {
    const projectCategoryFilter = category === 'all' ? {} : { category: `k/${category}` }
    const reviewCategoryFilter = category === 'all' ? {} : { project: { category: `k/${category}` } }
    
    const [reviews, projects] = await Promise.all([
      prisma.review.count({ where: reviewCategoryFilter }),
      prisma.project.count({ where: projectCategoryFilter }),
    ])
    
    reviewCount = reviews
    projectCount = projects
  } catch (error) {
    // Silently fail - stats are optional
    console.error('Error fetching category stats:', error)
  }

  const faqs = CATEGORY_FAQS[category] || []
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'

  return (
    <>
      {/* Breadcrumb Schema */}
      <BreadcrumbJsonLd 
        items={[
          { name: 'Home', url: '/' },
          { name: CATEGORY_META[category]?.title || category, url: `/k/${category}` },
        ]} 
      />
      
      {/* FAQ Schema (if available) */}
      {faqs.length > 0 && <FAQJsonLd questions={faqs} />}
      
      {/* Page Content */}
      <CategoryPageContent 
        category={category}
        categoryIcon={info.icon}
        categoryDescription={info.description}
        reviewCount={reviewCount}
        projectCount={projectCount}
      />
    </>
  )
}
