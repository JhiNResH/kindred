import { Metadata } from 'next'

export const dynamic = 'force-dynamic' // wagmi/RainbowKit needs browser APIs
import { GourmetSearchPage } from './GourmetSearchPage'
import { prisma } from '@/lib/prisma'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Restaurant Reviews - Maat Gourmet',
  description: 'Search and review restaurants with verified dining experiences. Community-powered restaurant ratings.',
  openGraph: {
    title: 'Maat Gourmet - Restaurant Reviews',
    description: 'Verified restaurant reviews powered by community trust',
    type: 'website',
  },
}

export default async function GourmetPage() {
  // Fetch all searched restaurants (even without reviews - real user activity!)
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
      },
      orderBy: {
        createdAt: 'desc',  // Most recently searched first
      },
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
    console.error('Error fetching restaurants:', error)
  }

  return (
    <>
      <BreadcrumbJsonLd 
        items={[
          { name: 'Home', url: '/' },
          { name: 'Gourmet', url: '/m/gourmet' },
        ]} 
      />
      
      <GourmetSearchPage recentRestaurants={recentRestaurants} />
    </>
  )
}
