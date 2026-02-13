import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
const SITE_NAME = 'Maat'
const DEFAULT_DESCRIPTION = 'The trust layer for everything. Stake tokens to review, predict project rankings, build reputation, and earn rewards.'

// ============================================================
// Metadata Generators
// ============================================================

export interface SEOMetadataOptions {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  keywords?: string[]
  noIndex?: boolean
}

export function generateMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = '/og-image.png',
  type = 'website',
  keywords = [],
  noIndex = false,
}: SEOMetadataOptions): Metadata {
  const url = `${BASE_URL}${path}`
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  
  const defaultKeywords = [
    'web3 reviews',
    'defi reviews',
    'crypto reputation',
    'blockchain trust',
    'staking platform',
    'prediction market',
    'project rankings',
    'kindred protocol',
  ]

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords],
    authors: [{ name: 'Maat Protocol' }],
    creator: 'Maat',
    publisher: 'Maat',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image.startsWith('http') ? image : `${BASE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${BASE_URL}${image}`],
      creator: '@MaatProtocol',
    },
    metadataBase: new URL(BASE_URL),
  }
}

// ============================================================
// Category-specific metadata
// ============================================================

export const CATEGORY_META: Record<string, { 
  title: string
  description: string
  keywords: string[]
}> = {
  'defi': {
    title: 'DeFi Reviews',
    description: 'Expert reviews of DeFi protocols. Find trusted lending platforms, DEXs, and yield farming opportunities with community-verified ratings.',
    keywords: ['defi reviews', 'lending protocol', 'dex review', 'yield farming', 'defi security', 'protocol audit'],
  },
  'perp-dex': {
    title: 'Perp DEX Reviews',
    description: 'Compare perpetual DEX platforms. Community ratings and expert analysis of derivatives trading protocols.',
    keywords: ['perp dex', 'perpetual exchange', 'derivatives trading', 'leverage trading', 'crypto futures'],
  },
  'memecoin': {
    title: 'Memecoin Reviews',
    description: 'Navigate the memecoin space safely. Community-driven reviews and rug-pull detection for meme tokens.',
    keywords: ['memecoin review', 'meme token', 'rug pull detector', 'degen coins', 'safe memecoins'],
  },
  'ai': {
    title: 'AI Project Reviews',
    description: 'Discover top AI and agent projects. Expert reviews of machine learning, AI agents, and data platforms.',
    keywords: ['ai crypto', 'ai agents', 'machine learning', 'ai token review', 'ai projects'],
  },
  'gourmet': {
    title: 'Restaurant Reviews',
    description: 'Verified restaurant reviews with blockchain-backed authenticity. Find the best dining experiences.',
    keywords: ['restaurant review', 'food review', 'verified dining', 'gourmet reviews', 'best restaurants'],
  },
  'saas': {
    title: 'SaaS Reviews',
    description: 'Honest software reviews backed by real usage data. Compare SaaS tools with community ratings.',
    keywords: ['saas review', 'software comparison', 'tool reviews', 'best software', 'productivity tools'],
  },
  'crypto': {
    title: 'Crypto Token Reviews',
    description: 'In-depth cryptocurrency reviews. Community-verified token analysis and security ratings.',
    keywords: ['crypto review', 'token analysis', 'coin review', 'crypto security', 'token rating'],
  },
  'agents': {
    title: 'AI Agent Reviews',
    description: 'Compare AI agents and automation tools. Expert analysis of autonomous systems and AI assistants.',
    keywords: ['ai agent', 'automation tools', 'ai assistant', 'autonomous agents', 'agent review'],
  },
}

export function getCategoryMetadata(category: string): Metadata {
  const meta = CATEGORY_META[category] || {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Reviews`,
    description: `Community reviews for ${category} category. Stake-verified ratings and expert analysis.`,
    keywords: [category, 'reviews', 'ratings'],
  }

  return generateMetadata({
    title: meta.title,
    description: meta.description,
    path: `/k/${category}`,
    keywords: meta.keywords,
  })
}

// ============================================================
// Schema.org JSON-LD Generators
// ============================================================

export interface ReviewSchemaData {
  reviewId: string
  projectName: string
  projectUrl?: string
  authorAddress: string
  authorName?: string
  ratingValue: number // 1-5 scale
  reviewBody: string
  datePublished: string
  upvotes: number
  downvotes: number
}

export function generateReviewSchema(review: ReviewSchemaData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: review.projectName,
      url: review.projectUrl,
    },
    author: {
      '@type': 'Person',
      name: review.authorName || `${review.authorAddress.slice(0, 6)}...${review.authorAddress.slice(-4)}`,
      identifier: review.authorAddress,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'Maat',
      url: BASE_URL,
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: review.upvotes,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/DislikeAction',
        userInteractionCount: review.downvotes,
      },
    ],
  }
}

export interface ProjectSchemaData {
  name: string
  description: string
  category: string
  address: string
  aggregateRating?: {
    ratingValue: number
    ratingCount: number
    reviewCount: number
  }
  image?: string
}

export function generateProjectSchema(project: ProjectSchemaData): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: project.name,
    description: project.description,
    category: project.category,
    identifier: project.address,
    brand: {
      '@type': 'Organization',
      name: project.name,
    },
  }

  if (project.image) {
    schema.image = project.image
  }

  if (project.aggregateRating && project.aggregateRating.ratingCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: project.aggregateRating.ratingValue,
      ratingCount: project.aggregateRating.ratingCount,
      reviewCount: project.aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}

export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maat',
    description: 'The trust layer for everything. Decentralized reputation protocol.',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.jpg`,
    sameAs: [
      'https://twitter.com/MaatProtocol',
      'https://github.com/kindred-protocol',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${BASE_URL}/docs`,
    },
  }
}

export function generateWebsiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Maat',
    url: BASE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  }
}
