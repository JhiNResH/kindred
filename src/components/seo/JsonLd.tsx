/**
 * JSON-LD Schema Component
 * Injects structured data for rich snippets in search results
 */

interface JsonLdProps {
  data: object | object[]
}

export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

/**
 * Pre-built schema components for common use cases
 */

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maat',
    description: 'The trust layer for everything. Decentralized reputation protocol.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'}/logo.jpg`,
    sameAs: [
      'https://twitter.com/MaatProtocol',
      'https://github.com/kindred-protocol',
    ],
  }
  
  return <JsonLd data={schema} />
}

export function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Maat',
    url: baseUrl,
    description: 'The trust layer for everything. Stake tokens to review, predict rankings, build reputation.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/k/defi?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
  
  return <JsonLd data={schema} />
}

interface ReviewJsonLdProps {
  reviewId: string
  projectName: string
  projectUrl?: string
  authorAddress: string
  authorName?: string
  ratingValue: number
  reviewBody: string
  datePublished: string
  upvotes: number
  downvotes: number
}

export function ReviewJsonLd({
  reviewId,
  projectName,
  projectUrl,
  authorAddress,
  authorName,
  ratingValue,
  reviewBody,
  datePublished,
  upvotes,
  downvotes,
}: ReviewJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${baseUrl}/reviews/${reviewId}`,
    itemReviewed: {
      '@type': 'Product',
      name: projectName,
      ...(projectUrl && { url: projectUrl }),
    },
    author: {
      '@type': 'Person',
      name: authorName || `${authorAddress.slice(0, 6)}...${authorAddress.slice(-4)}`,
      identifier: authorAddress,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: reviewBody,
    datePublished: datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'Maat',
      url: baseUrl,
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: upvotes,
      },
    ],
  }
  
  return <JsonLd data={schema} />
}

interface ProductJsonLdProps {
  name: string
  description: string
  category: string
  address: string
  ratingValue?: number
  ratingCount?: number
  reviewCount?: number
  image?: string
}

export function ProductJsonLd({
  name,
  description,
  category,
  address,
  ratingValue,
  ratingCount,
  reviewCount,
  image,
}: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
  const categorySlug = category.replace('k/', '')
  
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/k/${categorySlug}/${address}`,
    name: name,
    description: description,
    category: category,
    identifier: address,
    brand: {
      '@type': 'Organization',
      name: name,
    },
  }

  if (image) {
    schema.image = image
  }

  if (ratingValue && ratingCount && ratingCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      ratingCount: ratingCount,
      reviewCount: reviewCount || ratingCount,
      bestRating: 5,
      worstRating: 1,
    }
  }
  
  return <JsonLd data={schema} />
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }
  
  return <JsonLd data={schema} />
}

interface FAQJsonLdProps {
  questions: { question: string; answer: string }[]
}

export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
  
  return <JsonLd data={schema} />
}
