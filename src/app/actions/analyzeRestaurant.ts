'use server'

/**
 * Restaurant Analysis Action (Ma'at-style)
 * 
 * For k/gourmet category - gets restaurant data from Gemini + Google Places
 * including ratings, photos, must-try dishes, etc.
 */

import { searchPlace } from '@/lib/googlePlaces'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export interface RestaurantAnalysis {
  restaurantName: string
  score: number
  status: 'PURE' | 'UNSTABLE' | 'DECEPTIVE'
  summary: string
  platformScores?: { platform: string; score: number; reviewCount?: number }[]
  mustTry?: { name: string; description?: string; price?: string }[]
  warnings?: string[]
  priceRange?: string
  avgCost?: string
  bestFor?: string[]
  cuisine?: string
  ambiance?: string
  address?: string
  hours?: string
  photos?: string[]
  googleMapsUrl?: string
  criticalReviews?: { issue: string; source?: string; frequency?: string }[]
}

export async function analyzeRestaurant(query: string): Promise<RestaurantAnalysis | null> {
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured')
    return null
  }

  // First, try Google Places API for verified data
  let placesData = null
  try {
    placesData = await searchPlace(query)
    console.log('[Restaurant] Google Places result:', placesData?.name, placesData?.photos?.length, 'photos')
  } catch (e) {
    console.warn('[Restaurant] Google Places failed:', e)
  }

  // Include Places data in prompt if available
  const placesContext = placesData ? `
Google Places API Data (verified):
- Name: ${placesData.name}
- Rating: ${placesData.rating}/5 (${placesData.userRatingCount} reviews)
- Price: ${placesData.priceLevel || 'N/A'}
- Address: ${placesData.formattedAddress || 'N/A'}
- Photos available: ${placesData.photos?.length || 0}
` : ''

  const prompt = `Search for comprehensive restaurant information: "${query}"
${placesContext}

Search for:
1. Ratings from Yelp, Dianping (大眾點評), TripAdvisor, OpenRice, Google
2. Signature dishes with descriptions and prices
3. Ambiance and environment details
4. Service quality feedback
5. Average cost per person
6. Photos (provide real URLs from search results)
7. CRITICAL: Most common negative reviews and complaints

RETURN JSON FORMAT ONLY:
{
  "restaurantName": "Restaurant Name",
  "score": 0.0-5.0,
  "status": "PURE|UNSTABLE|DECEPTIVE",
  "summary": "2-3 sentence judgment on food quality, value, and overall experience.",
  "platformScores": [
    {"platform": "Google", "score": 4.5, "reviewCount": 500},
    {"platform": "Yelp", "score": 4.0, "reviewCount": 300}
  ],
  "mustTry": [
    {"name": "Dish Name", "description": "Description", "price": "$12"}
  ],
  "warnings": ["Busy on weekends", "Limited parking"],
  "priceRange": "$$",
  "avgCost": "$25-40 per person",
  "bestFor": ["Date night", "Family gathering"],
  "cuisine": "Taiwanese / Dim Sum",
  "ambiance": "Modern, upscale casual",
  "address": "Full address",
  "hours": "11:00 AM - 10:00 PM",
  "photos": ["https://...real_photo_url..."],
  "googleMapsUrl": "https://maps.google.com/...",
  "criticalReviews": [
    {"issue": "Long wait times", "source": "Yelp", "frequency": "Common"}
  ]
}

CRITICAL RULES:
1. NO HALLUCINATIONS - only report data you find
2. For photos, provide real URLs from search results (Google, Yelp, etc.)
3. If no data found, return status "UNSTABLE"
4. Verify restaurant name matches query`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return null
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response')
      return null
    }

    const result = JSON.parse(jsonMatch[0]) as RestaurantAnalysis
    
    // Merge Google Places data (more reliable)
    if (placesData) {
      // Use Google Places photos (verified, high quality)
      if (placesData.photos && placesData.photos.length > 0) {
        result.photos = placesData.photos
      }
      // Use Google address if available
      if (placesData.formattedAddress) {
        result.address = placesData.formattedAddress
      }
      // Add Google Maps URL
      if (placesData.placeId) {
        result.googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placesData.placeId}`
      }
      // Use Google rating as one of the platform scores
      if (placesData.rating && result.platformScores) {
        const hasGoogle = result.platformScores.some(p => p.platform.toLowerCase() === 'google')
        if (!hasGoogle) {
          result.platformScores.unshift({
            platform: 'Google',
            score: placesData.rating,
            reviewCount: placesData.userRatingCount
          })
        }
      }
    }
    
    return result

  } catch (error) {
    console.error('Restaurant analysis error:', error)
    return null
  }
}
