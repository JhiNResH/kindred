/**
 * Restaurant Verification API
 * Integrates Ma'at-style receipt/food photo verification
 * 
 * Verifies:
 * - Receipt images (restaurant name, date, amount)
 * - Food photos (authentic, not stock photos)
 * - Restaurant photos (signage, interior)
 * - Payment screenshots (transaction proof)
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Proof type max scores (different proof types have different max reliability)
const PROOF_TYPE_MAX_SCORES: Record<string, number> = {
  receipt: 100,    // Receipt is most reliable
  food: 85,        // Food photo less reliable
  restaurant: 70,  // Restaurant exterior/interior
  payment: 90,     // Payment screenshot
}

interface VerifyRequest {
  userAddress: string
  restaurantId: string
  restaurantName: string
  imageUrl: string
  rating: number
  proofType?: 'receipt' | 'food' | 'restaurant' | 'payment'
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 })
  }

  try {
    const body: VerifyRequest = await request.json()

    // Validate required fields
    if (!body.restaurantId || !body.imageUrl || !body.rating) {
      return NextResponse.json({
        success: false,
        verified: false,
        confidenceScore: 0,
        error: 'Missing required fields: restaurantId, imageUrl, rating'
      }, { status: 400 })
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({
        success: false,
        verified: false,
        confidenceScore: 0,
        error: 'Rating must be 1-5'
      }, { status: 400 })
    }

    // Validate image URL (prevent SSRF)
    const url = new URL(body.imageUrl)
    const allowedHosts = ['imgur.com', 'i.imgur.com', 'cloudinary.com', 'res.cloudinary.com', 'storage.googleapis.com']
    const isDataUrl = body.imageUrl.startsWith('data:image/')
    if (!isDataUrl && !allowedHosts.some(h => url.hostname.endsWith(h))) {
      return NextResponse.json({
        success: false,
        verified: false,
        confidenceScore: 0,
        error: 'Image URL must be from allowed hosts (imgur, cloudinary, gcs) or data URL'
      }, { status: 400 })
    }

    // Verify with Gemini
    const proofType = body.proofType || 'receipt'
    const maxScore = PROOF_TYPE_MAX_SCORES[proofType] || 85
    
    const verification = await verifyWithGemini(
      body.imageUrl,
      body.restaurantName || body.restaurantId,
      proofType,
      maxScore
    )

    // Return result
    if (!verification.verified || verification.confidenceScore < 60) {
      return NextResponse.json({
        success: true,
        verified: false,
        confidenceScore: verification.confidenceScore,
        reason: verification.reason || 'Verification failed - image does not meet requirements'
      })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      confidenceScore: verification.confidenceScore,
      proofType,
      restaurantName: body.restaurantName,
      reason: verification.reason
    })

  } catch (error) {
    console.error('[Gourmet Verify] Error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

async function verifyWithGemini(
  imageUrl: string,
  expectedRestaurant: string,
  proofType: string,
  maxScore: number
): Promise<{ verified: boolean; confidenceScore: number; reason?: string }> {

  const proofTypePrompts: Record<string, string> = {
    receipt: `You are verifying a RECEIPT from a restaurant.
Look for:
- Restaurant/store name on the receipt
- Date and time
- Items purchased
- Total amount
- Authentic receipt format (not handwritten, proper formatting)`,
    
    food: `You are verifying a FOOD PHOTO from a restaurant.
Look for:
- Real food (not stock photos or screenshots)
- Restaurant environment visible (table, plates, etc.)
- Authentic photo (not heavily filtered or from internet)
- Food quality and presentation`,
    
    restaurant: `You are verifying a RESTAURANT PHOTO.
Look for:
- Store signage or name visible
- Interior or exterior of actual restaurant
- Authentic photo (not from Google Maps or stock)
- Current/recent photo quality`,
    
    payment: `You are verifying a PAYMENT SCREENSHOT.
Look for:
- Merchant/restaurant name
- Transaction date
- Amount paid
- Payment method (Apple Pay, credit card, etc.)
- Authentic screenshot format`,
  }

  const verificationPrompt = `You are a verification AI for Kindred's k/gourmet restaurant review platform.

${proofTypePrompts[proofType] || proofTypePrompts.receipt}

The user claims this is proof of visiting: "${expectedRestaurant}"

IMPORTANT RULES:
- Restaurant name doesn't need to match exactly (e.g., "McDonald's" matches "McDonalds")
- Look for visual authenticity (not photoshopped, real photo)
- Be lenient but catch obvious fakes (stock photos, screenshots from internet)
- Maximum score for this proof type is ${maxScore}%

Respond in this exact JSON format only, no other text:
{
  "isValidProof": true,
  "detectedProofType": "${proofType}",
  "matchesExpected": true,
  "confidenceScore": 85,
  "reason": "brief explanation"
}`

  try {
    // Fetch image and convert to base64
    let imageData: string
    if (imageUrl.startsWith('data:')) {
      imageData = imageUrl.split(',')[1]
    } else {
      const imageResponse = await fetch(imageUrl)
      const arrayBuffer = await imageResponse.arrayBuffer()
      imageData = Buffer.from(arrayBuffer).toString('base64')
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: verificationPrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageData
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024
        }
      }),
    })

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`)
      return { verified: false, confidenceScore: 0, reason: 'AI service error' }
    }

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response')
      return { verified: false, confidenceScore: 0, reason: 'Invalid AI response' }
    }

    const result = JSON.parse(jsonMatch[0])

    const isVerified = result.isValidProof && 
                       result.confidenceScore >= 60 &&
                       (result.matchesExpected || result.detectedProofType === 'food')

    // Apply max score cap based on proof type
    const cappedScore = Math.min(maxScore, Math.max(0, result.confidenceScore || 0))

    return {
      verified: isVerified,
      confidenceScore: cappedScore,
      reason: result.reason
    }

  } catch (error) {
    console.error('Gemini verification error:', error)
    return { verified: false, confidenceScore: 0, reason: 'Verification error' }
  }
}
