import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RestaurantPage } from './RestaurantPage'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  const restaurant = await prisma.project.findFirst({
    where: {
      address: slug,
      category: 'k/gourmet',
    },
  })

  if (!restaurant) {
    return {
      title: 'Restaurant Not Found - Maat Gourmet',
    }
  }

  return {
    title: `${restaurant.name} Reviews - Maat Gourmet`,
    description: `Read verified reviews for ${restaurant.name}. Community-powered restaurant ratings.`,
    openGraph: {
      title: `${restaurant.name} - Maat Gourmet`,
      description: `Verified reviews for ${restaurant.name}`,
      type: 'website',
    },
  }
}

export default async function GourmetRestaurantPage({ params }: PageProps) {
  const { slug } = await params

  // Fetch restaurant with reviews and reviewer info
  const restaurant = await prisma.project.findFirst({
    where: {
      address: slug,
      category: 'k/gourmet',
    },
    include: {
      reviews: {
        include: {
          reviewer: {
            select: {
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      },
    },
  })

  if (!restaurant) {
    notFound()
  }

  // Transform to match RestaurantPage interface
  const restaurantData = {
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address,
    description: restaurant.description,
    website: restaurant.website,
    avgRating: restaurant.avgRating,
    reviewCount: restaurant.reviewCount,
    totalStaked: restaurant.totalStaked,
    reviews: restaurant.reviews.map(r => ({
      id: r.id,
      targetAddress: restaurant.address, // Restaurant slug
      targetName: restaurant.name,
      reviewerAddress: r.reviewer.address,
      rating: r.rating,
      content: r.content,
      category: restaurant.category,
      predictedRank: r.predictedRank,
      stakeAmount: r.stakeAmount,
      photoUrls: r.photoUrls ? JSON.parse(r.photoUrls as string) : [],
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      createdAt: r.createdAt.toISOString(),
      nftTokenId: r.nftTokenId || undefined,
    })),
  }

  return (
    <>
      <BreadcrumbJsonLd 
        items={[
          { name: 'Home', url: '/' },
          { name: 'Gourmet', url: '/m/gourmet' },
          { name: restaurant.name, url: `/k/gourmet/${slug}` },
        ]} 
      />
      
      <RestaurantPage restaurant={restaurantData} />
    </>
  )
}
