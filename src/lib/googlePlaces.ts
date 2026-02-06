/**
 * Google Places API Integration
 * 
 * Fetches restaurant photos and details from Google Places
 */

const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_PLACES_API_KEY

export interface PlaceDetails {
  name: string
  placeId: string
  rating?: number
  userRatingCount?: number
  priceLevel?: string
  formattedAddress?: string
  photos?: string[]
  types?: string[]
  website?: string
  phoneNumber?: string
  openingHours?: string[]
  location?: { lat: number; lng: number }
}

/**
 * Search for a place by text query
 */
export async function searchPlace(query: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_API_KEY) {
    console.error('Google API key not configured')
    return null
  }

  try {
    // Use Places API (New) - Text Search
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.types,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.location'
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'zh-TW',
          maxResultCount: 1
        })
      }
    )

    if (!response.ok) {
      console.error('Places API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    const place = data.places?.[0]
    
    if (!place) {
      console.log('No place found for:', query)
      return null
    }

    // Convert photo references to URLs
    const photos = place.photos?.slice(0, 5).map((photo: any) => 
      `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_API_KEY}`
    ) || []

    return {
      name: place.displayName?.text || query,
      placeId: place.id,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      priceLevel: place.priceLevel,
      formattedAddress: place.formattedAddress,
      photos,
      types: place.types,
      website: place.websiteUri,
      phoneNumber: place.nationalPhoneNumber,
      openingHours: place.regularOpeningHours?.weekdayDescriptions,
      location: place.location
    }

  } catch (error) {
    console.error('Places API error:', error)
    return null
  }
}

/**
 * Get photo URL from place photo reference
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
  if (!GOOGLE_API_KEY) return ''
  return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`
}
