import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stake`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/review`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // Category pages
  const categories = ['defi', 'perp-dex', 'memecoin', 'ai', 'gourmet', 'saas', 'crypto', 'agents']
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/k/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  // Dynamic project pages from database
  let projectPages: MetadataRoute.Sitemap = []
  try {
    const projects = await prisma.project.findMany({
      select: {
        address: true,
        category: true,
        updatedAt: true,
      },
      take: 500, // Limit for sitemap size
    })

    projectPages = projects.map((project) => {
      // Convert category format: "k/defi" -> "defi"
      const categorySlug = project.category.replace('k/', '')
      return {
        url: `${BASE_URL}/k/${categorySlug}/${project.address}`,
        lastModified: project.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }
    })
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error)
  }

  // Dynamic review pages from database
  let reviewPages: MetadataRoute.Sitemap = []
  try {
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        projectId: true,
        updatedAt: true,
      },
      orderBy: {
        upvotes: 'desc',
      },
      take: 1000, // Top 1000 reviews
    })

    reviewPages = reviews.map((review) => ({
      url: `${BASE_URL}/reviews/${review.id}`,
      lastModified: review.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error fetching reviews for sitemap:', error)
  }

  return [...staticPages, ...categoryPages, ...projectPages, ...reviewPages]
}
