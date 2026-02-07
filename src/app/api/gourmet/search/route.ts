import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeRestaurant } from '@/app/actions/analyzeRestaurant'

/**
 * POST /api/gourmet/search
 * Search for a restaurant by name, create if doesn't exist
 * Uses Gemini + Google Places for restaurant-specific analysis
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()
    
    // Generate slug
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if restaurant already exists (by name or slug)
    let restaurant = await prisma.project.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: 'insensitive' } },
          { address: slug },
        ],
        category: 'k/gourmet',
      },
    })

    // Create restaurant if doesn't exist
    if (!restaurant) {
      // Analyze restaurant with Gemini + Google Places
      console.log(`[Gourmet Search] Analyzing restaurant: ${trimmedName}`)
      const analysis = await analyzeRestaurant(trimmedName)
      
      if (!analysis) {
        console.warn(`[Gourmet Search] Analysis failed for: ${trimmedName}, creating basic entry`)
      }
      
      restaurant = await prisma.project.create({
        data: {
          name: analysis?.restaurantName || trimmedName,
          address: slug, // Use slug as "address" for restaurants
          category: 'k/gourmet',
          description: analysis?.summary || `${trimmedName} restaurant`,
          website: null,
          image: analysis?.photos?.[0] || null, // Logo from Google Places
          bannerImage: analysis?.photos?.[1] || null, // Banner image
          avgRating: 0,
          reviewCount: 0,
          totalStaked: "0",
          currentRank: null,
        },
      })
      
      // Store full analysis in ProjectAnalysisCache (using correct schema: query + result)
      if (analysis) {
        const cacheKey = trimmedName.toLowerCase()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour cache
        
        await prisma.projectAnalysisCache.upsert({
          where: { query: cacheKey },
          update: {
            result: JSON.stringify(analysis),
            updatedAt: new Date(),
            expiresAt,
            hitCount: { increment: 1 },
          },
          create: {
            query: cacheKey,
            result: JSON.stringify(analysis),
            expiresAt,
            hitCount: 1,
          },
        })
        console.log(`[Gourmet Search] Stored analysis for: ${restaurant.name}`)
      }
    }

    return NextResponse.json({ 
      slug,
      id: restaurant.id,
      name: restaurant.name,
      created: !restaurant, // Whether it was just created
    })
  } catch (error) {
    console.error('Gourmet search error:', error)
    return NextResponse.json(
      { error: 'Failed to search restaurant' },
      { status: 500 }
    )
  }
}
