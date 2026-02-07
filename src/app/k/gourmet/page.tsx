import { Metadata } from 'next'
import { GourmetSearchPage } from './GourmetSearchPage'
import { prisma } from '@/lib/prisma'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Restaurant Reviews - Kindred Gourmet',
  description: 'Search and review restaurants with verified dining experiences. Community-powered restaurant ratings.',
  openGraph: {
    title: 'Kindred Gourmet - Restaurant Reviews',
    description: 'Verified restaurant reviews powered by community trust',
    type: 'website',
  },
}

export default async function GourmetPage() {
  // Fetch popular restaurants (only ones with reviews)
  let recentRestaurants: Array<{
    id: string
    name: string
    address: string
    reviewCount: number
    avgRating: number
  }> = []

  try {
    const projects = await prisma.project.findMany({
      where: {
        category: 'k/gourmet',
        reviewCount: { gt: 0 },  // Only show restaurants with at least 1 review
      },
      orderBy: [
        { reviewCount: 'desc' },  // Sort by most reviewed first
        { avgRating: 'desc' },    // Then by highest rating
      ],
      take: 20,
      select: {
        id: true,
        name: true,
        address: true,
        reviewCount: true,
        avgRating: true,
      },
    })
    recentRestaurants = projects
  } catch (error) {
    console.error('Error fetching popular restaurants:', error)
  }

  return (
    <>
      <BreadcrumbJsonLd 
        items={[
          { name: 'Home', url: '/' },
          { name: 'Gourmet', url: '/k/gourmet' },
        ]} 
      />
      
      <GourmetSearchPage recentRestaurants={recentRestaurants} />
    </>
  )
}
