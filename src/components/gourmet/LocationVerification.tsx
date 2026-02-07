'use client'

import { useState } from 'react'
import { 
  getUserLocation, 
  verifyLocation, 
  createLocationProof,
  checkLocationPermission,
  formatDistance,
  type Restaurant,
  type Location,
  type VerificationResult,
} from '@/lib/gps-verification'
import { useAccount } from 'wagmi'

interface LocationVerificationProps {
  restaurant: Restaurant
  onVerified?: (proof: string) => void
  onError?: (error: string) => void
}

export function LocationVerification({ 
  restaurant, 
  onVerified, 
  onError 
}: LocationVerificationProps) {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt')

  const handleVerifyLocation = async () => {
    if (!address) {
      onError?.('Please connect your wallet first')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Check permission first
      const permission = await checkLocationPermission()
      setPermissionState(permission)

      if (permission === 'denied') {
        throw new Error('Location permission denied. Please enable location access in your browser settings.')
      }

      // Get user location
      const userLocation = await getUserLocation()

      // Verify location
      const verification = verifyLocation(userLocation, restaurant)
      setResult(verification)

      if (verification.verified) {
        // Create proof
        const { proof } = await createLocationProof(
          userLocation,
          restaurant,
          address
        )

        onVerified?.(proof)
      } else {
        onError?.(
          `You are ${formatDistance(verification.distance)} from ${restaurant.name}. ` +
          `You need to be within ${formatDistance(restaurant.verificationRadius)}.`
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Location verification failed'
      onError?.(message)
      setResult({
        verified: false,
        distance: -1,
        withinRadius: false,
        timestamp: Date.now(),
        error: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3">
          <h3 className="font-medium text-gray-900">📍 Location Verification</h3>
          <p className="text-sm text-gray-600">
            Verify you're at {restaurant.name} to unlock premium insights
          </p>
        </div>

        {/* Verification radius info */}
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          <strong>Required:</strong> Within {formatDistance(restaurant.verificationRadius)} of restaurant
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerifyLocation}
          disabled={loading || !address}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying location...
            </span>
          ) : (
            '🔍 Verify My Location'
          )}
        </button>

        {/* Permission denied warning */}
        {permissionState === 'denied' && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
            ⚠️ Location access denied. Please enable location permissions in your browser settings.
          </div>
        )}

        {/* Verification result */}
        {result && (
          <div className={`mt-4 rounded-md p-3 text-sm ${
            result.verified 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {result.verified ? (
              <div>
                <div className="font-medium">✅ Verification Successful!</div>
                <div className="mt-1">
                  You are {formatDistance(result.distance)} from {restaurant.name}
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium">❌ Verification Failed</div>
                <div className="mt-1">
                  {result.error || `Distance: ${formatDistance(result.distance)}`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
        🔒 <strong>Privacy:</strong> Your exact location is never stored. We only verify you're within the required radius.
        <br />
        🚀 <strong>Future:</strong> ZK proofs will enable fully privacy-preserving verification.
      </div>
    </div>
  )
}
