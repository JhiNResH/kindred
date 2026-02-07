/**
 * Restaurant Basic Info API (FREE)
 * Returns basic restaurant information from Gemini analysis
 * 
 * This is different from /api/gourmet/insight which is paid premium content.
 * This endpoint provides free basic info for all users.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

interface RestaurantInfo {
  platformScores?: Array<{ platform: string; score: string; reviewCount?: number }>
  cuisine?: string
  priceRange?: string
  avgCost?: string
  hours?: string
  address?: string
  googleMapsUrl?: string
  bestFor?: string[]
  mustTry?: Array<{ name: string; price?: string; description?: string }>
  warnings?: string[]
  criticalReviews?: Array<{ issue: string; source?: string }>
  photos?: string[] // Restaurant photos (logo, banner, interior)
}

/**
 * POST /api/gourmet/info
 * Get basic restaurant information (FREE)
 */
export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 })
  }

  try {
    const { restaurantName } = await request.json()

    if (!restaurantName || typeof restaurantName !== 'string') {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 })
    }

    const info = await getRestaurantInfo(restaurantName)

    return NextResponse.json(info)
  } catch (error) {
    console.error('[Gourmet Info] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant info' },
      { status: 500 }
    )
  }
}

async function getRestaurantInfo(restaurantName: string): Promise<RestaurantInfo> {
  const sanitizedName = restaurantName
    .replace(/["\n\r\\]/g, '')
    .slice(0, 200)

  // CRITICAL: Get real photos from Google Places API first!
  let placesData = null
  try {
    console.log('[Gourmet Info] 🔍 Calling searchPlace for:', sanitizedName)
    placesData = await searchPlace(sanitizedName)
    
    if (placesData?.photos && placesData.photos.length > 0) {
      console.log('[Gourmet Info] ✅ Got', placesData.photos.length, 'real photos from Google Places')
    } else {
      console.warn('[Gourmet Info] ⚠️  searchPlace returned but no photos:', placesData)
    }
  } catch (e) {
    console.error('[Gourmet Info] ❌ Google Places exception:', e)
  }

  const prompt = `You are a restaurant information expert. Analyze the restaurant: "${sanitizedName}"

Based on the restaurant name, provide realistic basic information.

Respond ONLY with valid JSON in this exact format:
{
  "platformScores": [
    {"platform": "Google", "score": "4.5", "reviewCount": 1234},
    {"platform": "Yelp", "score": "4.0", "reviewCount": 567},
    {"platform": "TripAdvisor", "score": "4.2", "reviewCount": 890}
  ],
  "cuisine": "French Fine Dining",
  "priceRange": "$$$",
  "avgCost": "$150-200 per person",
  "hours": "Tue-Sun 6PM-11PM, Closed Mon",
  "address": "123 Main St, Los Angeles, CA",
  "googleMapsUrl": "https://maps.google.com/?q=restaurant+name",
  "bestFor": ["Date Night", "Special Occasions", "Business Dinners"],
  "mustTry": [
    {"name": "Signature Dish 1", "price": "$45", "description": "Chef's specialty"},
    {"name": "Signature Dish 2", "price": "$38", "description": "Customer favorite"}
  ],
  "warnings": ["Reservations required", "Dress code enforced"],
  "criticalReviews": [
    {"issue": "Long wait times even with reservation", "source": "Yelp"},
    {"issue": "Parking can be difficult", "source": "Google"}
  ],
  "photos": [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"
  ]
}

IMPORTANT:
- All fields are optional but provide as much as you can infer
- Use realistic scores (4.0-4.8 range for good restaurants)
- Price range: $ (cheap), $$ (moderate), $$$ (expensive), $$$$ (very expensive)
- Hours should be realistic for the restaurant type
- Make up a plausible address based on the name
- Google Maps URL should include the restaurant name
- Best For tags should match the cuisine/vibe
- Must Try should have 2-5 dishes
- Warnings should be realistic common issues
- Critical Reviews should be common complaints
- Return ONLY valid JSON, no other text`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`)
      return getDefaultInfo(sanitizedName, placesData?.photos)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // CRITICAL: Merge real Google Places photos!
      if (placesData?.photos && placesData.photos.length > 0) {
        parsed.photos = placesData.photos
        console.log('[Gourmet Info] ✅ Merged', placesData.photos.length, 'real photos from Google Places')
      } else {
        console.warn('[Gourmet Info] ⚠️  No Google Places photos, using fallback')
      }
      
      return parsed
    }

    return getDefaultInfo(sanitizedName, placesData?.photos)

  } catch (error) {
    console.error('Gemini info error:', error)
    return getDefaultInfo(sanitizedName)
  }
}

function getDefaultInfo(name: string, photos?: string[]): RestaurantInfo {
  return {
    platformScores: [
      { platform: 'Google', score: '4.2', reviewCount: 500 },
      { platform: 'Yelp', score: '3.8', reviewCount: 200 },
    ],
    cuisine: 'Restaurant',
    priceRange: '$$',
    avgCost: '$30-50 per person',
    hours: 'Mon-Sun 11AM-10PM',
    address: 'Location TBA',
    googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name)}`,
    bestFor: ['Casual Dining'],
    mustTry: [
      { name: 'Signature Dish', price: '$25', description: 'House specialty' },
    ],
    warnings: ['Call ahead for reservations'],
    criticalReviews: [
      { issue: 'Wait times can be long during peak hours', source: 'Community' },
    ],
    // Use Google Places photos if available, otherwise fallback to Unsplash
    photos: photos && photos.length > 0 ? photos : [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', // Restaurant interior
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', // Restaurant banner
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', // Food close-up
    ],
  }
}
