/**
 * GPS Verification for Restaurant Check-ins
 * Simplified version for MVP - verifies user is near restaurant location
 * 
 * Future enhancements:
 * - ZK proofs for privacy-preserving location verification
 * - TEE (Trusted Execution Environment) integration
 * - Multi-party computation for location attestation
 */

export interface Location {
  latitude: number
  longitude: number
  accuracy?: number // meters
  timestamp?: number
}

export interface Restaurant {
  id: string
  name: string
  location: Location
  verificationRadius: number // meters (default: 100m)
}

export interface VerificationResult {
  verified: boolean
  distance: number // meters
  withinRadius: boolean
  timestamp: number
  error?: string
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Verify user is within specified radius of restaurant
 * @param userLocation - User's current GPS location
 * @param restaurant - Restaurant to verify against
 * @returns Verification result
 */
export function verifyLocation(
  userLocation: Location,
  restaurant: Restaurant
): VerificationResult {
  try {
    // Validate inputs
    if (!userLocation || !restaurant.location) {
      throw new Error('Invalid location data')
    }

    // Calculate distance
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      restaurant.location.latitude,
      restaurant.location.longitude
    )

    // Check if within radius
    const withinRadius = distance <= restaurant.verificationRadius

    return {
      verified: withinRadius,
      distance: Math.round(distance),
      withinRadius,
      timestamp: Date.now(),
    }
  } catch (error) {
    return {
      verified: false,
      distance: -1,
      withinRadius: false,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get user's current location using browser Geolocation API
 * @param options - Geolocation options
 * @returns Promise<Location>
 */
export function getUserLocation(
  options?: PositionOptions
): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    )
  })
}

/**
 * Create a location proof (simplified version)
 * In production, this should use ZK proofs or TEE attestation
 * 
 * @param userLocation - User's location
 * @param restaurant - Restaurant being verified
 * @param userAddress - User's wallet address
 * @returns Location proof object
 */
export async function createLocationProof(
  userLocation: Location,
  restaurant: Restaurant,
  userAddress: string
): Promise<{
  proof: string
  verified: boolean
  timestamp: number
}> {
  const verification = verifyLocation(userLocation, restaurant)

  // Simplified proof (just a hash for MVP)
  // TODO: Replace with ZK proof or TEE attestation
  const proofData = {
    userAddress,
    restaurantId: restaurant.id,
    verified: verification.verified,
    distance: verification.distance,
    timestamp: verification.timestamp,
  }

  const proof = btoa(JSON.stringify(proofData))

  return {
    proof,
    verified: verification.verified,
    timestamp: verification.timestamp,
  }
}

/**
 * Verify a location proof
 * @param proof - The proof to verify
 * @returns Verification result
 */
export function verifyLocationProof(proof: string): {
  valid: boolean
  data?: any
  error?: string
} {
  try {
    const decoded = atob(proof)
    const data = JSON.parse(decoded)

    // Basic validation
    const now = Date.now()
    const proofAge = now - data.timestamp
    const MAX_AGE = 5 * 60 * 1000 // 5 minutes

    if (proofAge > MAX_AGE) {
      return {
        valid: false,
        error: 'Proof expired (max age: 5 minutes)',
      }
    }

    return {
      valid: data.verified,
      data,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid proof format',
    }
  }
}

/**
 * Check if location permissions are granted
 */
export async function checkLocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return 'denied' // Fallback for browsers without Permissions API
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch (error) {
    return 'denied'
  }
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
